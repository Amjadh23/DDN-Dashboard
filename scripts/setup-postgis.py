"""Install the core PostGIS extension into the repository's portable PostgreSQL.

The source archive may be sparse: its ZIP central directory must be present, while
individual compressed members can be missing. This script repairs only the ZIP
members required by the core ``postgis`` extension, validates their ZIP CRCs,
and installs only files that do not already exist in the PostgreSQL tree.
"""

from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import shutil
import struct
import sys
import time
import urllib.error
import urllib.request
import zipfile
import zlib


SOURCE_URL = (
    "https://download.osgeo.org/postgis/windows/pg17/"
    "postgis-bundle-pg17-3.6.2x64.zip"
)
EXPECTED_ARCHIVE_SIZE = 123_959_035
ARCHIVE_PREFIX = "postgis-bundle-pg17-3.6.2x64/"
CORE_MEMBERS = (
    f"{ARCHIVE_PREFIX}lib/postgis-3.dll",
    f"{ARCHIVE_PREFIX}share/extension/postgis--3.6.2.sql",
    f"{ARCHIVE_PREFIX}share/extension/postgis.control",
)
WINDOWS_SYSTEM_DLLS = {
    "advapi32.dll",
    "bcrypt.dll",
    "crypt32.dll",
    "gdi32.dll",
    "iphlpapi.dll",
    "kernel32.dll",
    "msvcrt.dll",
    "ole32.dll",
    "oleaut32.dll",
    "psapi.dll",
    "rpcrt4.dll",
    "secur32.dll",
    "shell32.dll",
    "shlwapi.dll",
    "user32.dll",
    "userenv.dll",
    "version.dll",
    "winhttp.dll",
    "winmm.dll",
    "winsock.dll",
    "winspool.drv",
    "ws2_32.dll",
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def member_destination(member: str, pg_root: Path) -> Path:
    relative = member.removeprefix(ARCHIVE_PREFIX)
    if relative.startswith("lib/"):
        return pg_root / "lib" / Path(relative).name
    if relative.startswith("bin/"):
        return pg_root / "bin" / Path(relative).name
    if relative.startswith("share/extension/"):
        return pg_root / "share" / "extension" / Path(relative).name
    raise ValueError(f"Unsupported installation member: {member}")


def fetch_range(url: str, start: int, end: int, archive: Path) -> None:
    expected = end - start + 1
    last_error: Exception | None = None
    for attempt in range(1, 6):
        request = urllib.request.Request(
            url,
            headers={
                "Accept-Encoding": "identity",
                "Range": f"bytes={start}-{end}",
                "User-Agent": "dashboard-postgis-setup/1.0",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                if response.status != 206:
                    raise RuntimeError(
                        f"Server ignored byte range {start}-{end}: HTTP {response.status}"
                    )
                content_range = response.headers.get("Content-Range", "")
                expected_range = f"bytes {start}-{end}/{EXPECTED_ARCHIVE_SIZE}"
                if content_range != expected_range:
                    raise RuntimeError(
                        f"Unexpected Content-Range {content_range!r}; "
                        f"expected {expected_range!r}"
                    )
                data = response.read(expected + 1)
                if len(data) != expected:
                    raise RuntimeError(
                        f"Short range response for {start}-{end}: {len(data)} bytes"
                    )
            with archive.open("r+b") as handle:
                handle.seek(start)
                handle.write(data)
            return
        except (OSError, RuntimeError, urllib.error.URLError) as exc:
            last_error = exc
            if attempt < 5:
                time.sleep(min(2**attempt, 8))
    raise RuntimeError(f"Could not fetch archive range {start}-{end}") from last_error


def repair_member(
    archive_path: Path, info: zipfile.ZipInfo, url: str, chunk_size: int
) -> bytes:
    try:
        with zipfile.ZipFile(archive_path) as archive:
            return archive.read(info.filename)
    except (EOFError, OSError, zipfile.BadZipFile, zlib.error):
        pass

    # Refresh the local header first so the data offset can be read safely.
    fetch_range(url, info.header_offset, info.header_offset + 29, archive_path)
    with archive_path.open("rb") as handle:
        handle.seek(info.header_offset)
        header = handle.read(30)
    if len(header) != 30 or header[:4] != b"PK\x03\x04":
        raise RuntimeError(f"Invalid local ZIP header for {info.filename}")
    name_length, extra_length = struct.unpack_from("<HH", header, 26)
    data_start = info.header_offset + 30 + name_length + extra_length
    data_end = data_start + info.compress_size - 1
    cursor = info.header_offset + 30
    while cursor <= data_end:
        end = min(cursor + chunk_size - 1, data_end)
        fetch_range(url, cursor, end, archive_path)
        cursor = end + 1

    with zipfile.ZipFile(archive_path) as archive:
        return archive.read(info.filename)


def rva_to_offset(data: bytes, pe_offset: int, rva: int) -> int:
    section_count = struct.unpack_from("<H", data, pe_offset + 6)[0]
    optional_size = struct.unpack_from("<H", data, pe_offset + 20)[0]
    section_offset = pe_offset + 24 + optional_size
    for index in range(section_count):
        offset = section_offset + index * 40
        virtual_size, virtual_address, raw_size, raw_offset = struct.unpack_from(
            "<IIII", data, offset + 8
        )
        span = max(virtual_size, raw_size)
        if virtual_address <= rva < virtual_address + span:
            return raw_offset + (rva - virtual_address)
    raise ValueError(f"PE RVA 0x{rva:x} is outside file sections")


def pe_imports(data: bytes) -> set[str]:
    if data[:2] != b"MZ":
        raise ValueError("DLL does not have an MZ header")
    pe_offset = struct.unpack_from("<I", data, 0x3C)[0]
    if data[pe_offset : pe_offset + 4] != b"PE\0\0":
        raise ValueError("DLL does not have a PE header")
    optional_offset = pe_offset + 24
    magic = struct.unpack_from("<H", data, optional_offset)[0]
    directory_offset = optional_offset + (112 if magic == 0x20B else 96)
    import_rva, import_size = struct.unpack_from("<II", data, directory_offset + 8)
    if import_rva == 0 or import_size == 0:
        return set()
    descriptor_offset = rva_to_offset(data, pe_offset, import_rva)
    imports: set[str] = set()
    while descriptor_offset + 20 <= len(data):
        descriptor = struct.unpack_from("<IIIII", data, descriptor_offset)
        if descriptor == (0, 0, 0, 0, 0):
            break
        name_offset = rva_to_offset(data, pe_offset, descriptor[3])
        name_end = data.index(b"\0", name_offset)
        imports.add(data[name_offset:name_end].decode("ascii").lower())
        descriptor_offset += 20
    return imports


def existing_names(directory: Path) -> dict[str, Path]:
    return {item.name.lower(): item for item in directory.iterdir() if item.is_file()}


def install(args: argparse.Namespace) -> list[tuple[Path, str, str]]:
    archive_path = args.archive.resolve()
    pg_root = args.pg_root.resolve()
    if not archive_path.is_file():
        raise FileNotFoundError(archive_path)
    if archive_path.stat().st_size != EXPECTED_ARCHIVE_SIZE:
        raise RuntimeError(
            f"Sparse archive size is {archive_path.stat().st_size}; "
            f"expected {EXPECTED_ARCHIVE_SIZE}"
        )
    if not (pg_root / "bin" / "postgres.exe").is_file():
        raise RuntimeError(f"PostgreSQL root is invalid: {pg_root}")

    with zipfile.ZipFile(archive_path) as archive:
        infos = {info.filename: info for info in archive.infolist()}
        bundle_dlls = {
            Path(info.filename).name.lower(): info.filename
            for info in archive.infolist()
            if info.filename.startswith(f"{ARCHIVE_PREFIX}bin/")
            and "/postgisgui/" not in info.filename
            and info.filename.lower().endswith(".dll")
            and info.filename.count("/") == 2
        }

    missing_core = [name for name in CORE_MEMBERS if name not in infos]
    if missing_core:
        raise RuntimeError(f"Archive lacks core members: {', '.join(missing_core)}")

    existing_bin = existing_names(pg_root / "bin")
    member_data: dict[str, bytes] = {}
    pending = list(CORE_MEMBERS)
    planned: set[str] = set()

    while pending:
        member = pending.pop(0)
        if member in planned:
            continue
        planned.add(member)
        info = infos[member]
        data = repair_member(archive_path, info, args.url, args.chunk_size)
        member_data[member] = data
        if not member.lower().endswith(".dll"):
            continue
        for imported in sorted(pe_imports(data)):
            if imported in WINDOWS_SYSTEM_DLLS or imported.startswith("api-ms-win-"):
                continue
            if imported in existing_bin:
                continue
            dependency = bundle_dlls.get(imported)
            if dependency is None:
                # PostgreSQL extension DLLs legitimately import postgres.exe.
                if imported != "postgres.exe":
                    print(f"External runtime import: {imported}")
                continue
            pending.append(dependency)

    results: list[tuple[Path, str, str]] = []
    for member in sorted(planned):
        destination = member_destination(member, pg_root)
        data = member_data[member]
        digest = sha256_bytes(data)
        if destination.exists():
            existing_digest = hashlib.sha256(destination.read_bytes()).hexdigest()
            if existing_digest != digest:
                raise RuntimeError(
                    f"Refusing to overwrite existing non-matching file: {destination}"
                )
            action = "unchanged"
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            temporary = destination.with_name(f".{destination.name}.tmp")
            with temporary.open("xb") as handle:
                handle.write(data)
                handle.flush()
                os.fsync(handle.fileno())
            shutil.move(temporary, destination)
            action = "installed"
        results.append((destination, action, digest))
    return results


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--archive",
        type=Path,
        default=Path(".runtime/downloads/postgis-sparse.zip"),
    )
    parser.add_argument(
        "--pg-root", type=Path, default=Path(".runtime/postgresql/pgsql")
    )
    parser.add_argument("--url", default=SOURCE_URL)
    parser.add_argument("--chunk-size", type=int, default=256 * 1024)
    return parser.parse_args()


def main() -> int:
    try:
        results = install(parse_args())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    for destination, action, digest in results:
        print(f"{action}: {destination} sha256={digest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
