import { execFile } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import ExcelJS from 'exceljs';
import { uploadColumns } from '../lib/domain/uploads';

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 1_000;
const MAX_CELL_CHARS = 256;
const MAX_ZIP_ENTRIES = 1_000;
const MAX_ZIP_EXPANDED_BYTES = 10 * 1024 * 1024;
const DANGEROUS_CELL = /^[\s\u0000-\u001f]*[=+\-@]/;

interface ZipEntry {
  name: string;
  method: number;
  flags: number;
  compressedSize: number;
  expandedSize: number;
  localOffset: number;
}

function reject(message: string): never {
  throw new Error(message);
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const minimum = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return reject('The XLSX ZIP directory is invalid.');
}

function extractEntry(buffer: Buffer, entry: ZipEntry): Buffer {
  const offset = entry.localOffset;
  if (offset < 0 || offset + 30 > buffer.length || buffer.readUInt32LE(offset) !== 0x04034b50)
    return reject('The XLSX ZIP entry is invalid.');
  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (start < 0 || end > buffer.length) return reject('The XLSX ZIP entry is invalid.');
  const compressed = buffer.subarray(start, end);
  if (entry.method === 0) return Buffer.from(compressed);
  if (entry.method === 8)
    return inflateRawSync(compressed, { maxOutputLength: MAX_ZIP_EXPANDED_BYTES });
  return reject('The XLSX ZIP compression method is not allowed.');
}

function inspectXlsxArchive(buffer: Buffer): void {
  const endOffset = findEndOfCentralDirectory(buffer);
  const disk = buffer.readUInt16LE(endOffset + 4);
  const centralDisk = buffer.readUInt16LE(endOffset + 6);
  const diskEntries = buffer.readUInt16LE(endOffset + 8);
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  const directorySize = buffer.readUInt32LE(endOffset + 12);
  const directoryOffset = buffer.readUInt32LE(endOffset + 16);
  if (
    disk !== 0 ||
    centralDisk !== 0 ||
    diskEntries !== entryCount ||
    entryCount > MAX_ZIP_ENTRIES ||
    entryCount === 0xffff ||
    directoryOffset + directorySize > endOffset
  )
    reject('The XLSX ZIP directory is invalid or exceeds safe limits.');

  let offset = directoryOffset;
  let expandedTotal = 0;
  const entries: ZipEntry[] = [];
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50)
      reject('The XLSX ZIP directory is invalid.');
    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const expandedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const next = nameStart + nameLength + extraLength + commentLength;
    if (next > buffer.length) reject('The XLSX ZIP directory is invalid.');
    const name = buffer.subarray(nameStart, nameStart + nameLength).toString('utf8');
    const normalised = name.replaceAll('\\', '/').toLowerCase();
    if (
      !name ||
      name.includes('\0') ||
      path.posix.isAbsolute(normalised) ||
      normalised.split('/').includes('..')
    )
      reject('The XLSX ZIP contains an unsafe path.');
    if ((flags & 0x1) !== 0) reject('Encrypted XLSX archives are not allowed.');
    if (method !== 0 && method !== 8) reject('The XLSX ZIP compression method is not allowed.');
    if (
      normalised.endsWith('.bin') ||
      normalised.includes('vbaproject') ||
      normalised.includes('/macrosheets/') ||
      normalised.includes('/dialogsheets/') ||
      normalised.includes('/embeddings/')
    )
      reject('Macro or embedded executable content is not allowed.');
    expandedTotal += expandedSize;
    if (
      expandedSize > MAX_ZIP_EXPANDED_BYTES ||
      expandedTotal > MAX_ZIP_EXPANDED_BYTES ||
      (compressedSize === 0 ? expandedSize > 0 : expandedSize / compressedSize > 100)
    )
      reject('XLSX ZIP expansion exceeds the safe limit.');
    entries.push({ name: normalised, method, flags, compressedSize, expandedSize, localOffset });
    offset = next;
  }
  if (offset !== directoryOffset + directorySize) reject('The XLSX ZIP directory is inconsistent.');

  for (const entry of entries) {
    if (entry.name.endsWith('.rels') || entry.name === '[content_types].xml') {
      let xml: string;
      try {
        xml = extractEntry(buffer, entry).toString('utf8');
      } catch {
        reject('The XLSX ZIP metadata cannot be safely inspected.');
      }
      if (/TargetMode\s*=\s*["']External["']/i.test(xml))
        reject('External relationship targets are not allowed.');
      if (/externalLink|vbaProject|macroEnabled/i.test(xml))
        reject('Macro or external relationship metadata is not allowed.');
    }
  }
}

function assertCell(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')
    return reject('Formula or rich cell payloads are not allowed.');
  if (typeof value === 'number' && !Number.isFinite(value))
    return reject('Non-finite numbers are not allowed.');
  if (typeof value === 'string') {
    if (value.length > MAX_CELL_CHARS) reject('A cell exceeds the 256 character limit.');
    if (DANGEROUS_CELL.test(value)) reject('Formula payloads are not allowed.');
  }
  return value;
}

function assertHeaders(headers: unknown[]): void {
  if (
    headers.length !== uploadColumns.length ||
    uploadColumns.some((column, index) => headers[index] !== column)
  )
    reject('Upload headers must exactly match the versioned template.');
}

function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else quoted = false;
      } else field += character;
    } else if (character === '"' && field.length === 0) quoted = true;
    else if (character === ',') {
      record.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      record.push(field);
      if (record.some((value) => value !== '')) records.push(record);
      record = [];
      field = '';
    } else field += character;
  }
  if (quoted) reject('The CSV contains an unterminated quoted field.');
  if (field !== '' || record.length > 0) {
    record.push(field);
    if (record.some((value) => value !== '')) records.push(record);
  }
  return records;
}

function rowsFromValues(values: unknown[][]): Record<string, unknown>[] {
  if (values.length === 0) reject('The upload has no header row.');
  const headers = values[0].map(assertCell);
  assertHeaders(headers);
  const body = values.slice(1).filter((row) => row.some((value) => value !== null && value !== ''));
  if (body.length > MAX_ROWS) reject('Uploads are limited to 1,000 rows.');
  return body.map((valuesRow) => {
    if (valuesRow.length > uploadColumns.length)
      reject('A row contains columns outside the template.');
    const row: Record<string, unknown> = {};
    uploadColumns.forEach((column, index) => {
      row[column] = assertCell(valuesRow[index]);
    });
    return row;
  });
}

async function parseCsv(buffer: Buffer): Promise<Record<string, unknown>[]> {
  if (buffer.length === 0) reject('The CSV is empty.');
  if (buffer.includes(0)) reject('The CSV signature is invalid.');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return reject('The CSV must use valid UTF-8.');
  }
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return rowsFromValues(parseCsvRecords(text));
}

async function parseXlsx(buffer: Buffer): Promise<Record<string, unknown>[]> {
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50)
    reject('The XLSX signature is invalid.');
  inspectXlsxArchive(buffer);
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  } catch {
    return reject('The XLSX workbook is invalid.');
  }
  if (workbook.worksheets.length === 0) reject('The XLSX workbook has no worksheets.');
  for (const sheet of workbook.worksheets) {
    sheet.eachRow((row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (
          cell.formula ||
          (typeof cell.value === 'object' && cell.value !== null && 'formula' in cell.value)
        )
          reject('Formula cells are not allowed.');
        assertCell(cell.value);
      });
    });
  }
  const data = workbook.getWorksheet('Data') ?? workbook.worksheets[0];
  const values: unknown[][] = [];
  data.eachRow({ includeEmpty: false }, (row) => {
    const output: unknown[] = [];
    for (let index = 1; index <= Math.max(row.cellCount, uploadColumns.length); index += 1)
      output.push(row.getCell(index).value);
    values.push(output);
  });
  return rowsFromValues(values);
}

export async function parseUpload(
  buffer: Buffer,
  format: 'csv' | 'xlsx',
): Promise<Record<string, unknown>[]> {
  if (buffer.length > MAX_FILE_BYTES) reject('Uploads are limited to 2 MiB.');
  if (format === 'csv') return parseCsv(buffer);
  if (format === 'xlsx') return parseXlsx(buffer);
  return reject('The upload format is not allowed.');
}

async function available(file: string): Promise<boolean> {
  try {
    await access(file, fsConstants.X_OK);
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function findScanner(): Promise<string> {
  if (process.env.SCANNER_PATH) {
    if (await available(process.env.SCANNER_PATH)) return process.env.SCANNER_PATH;
    return reject('The malware scanner is unavailable.');
  }
  const platformRoot = 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform';
  try {
    const versions = (await readdir(platformRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
    for (const versionDirectory of versions) {
      const candidate = path.join(platformRoot, versionDirectory, 'MpCmdRun.exe');
      if (await available(candidate)) return candidate;
    }
  } catch {
    // The fallback below is checked without exposing discovery details.
  }
  const fallback = 'C:\\Program Files\\Windows Defender\\MpCmdRun.exe';
  if (await available(fallback)) return fallback;
  return reject('The malware scanner is unavailable.');
}

export async function scanFile(file: string): Promise<void> {
  const scanner = await findScanner();
  try {
    if (!(await stat(file)).isFile()) reject('The quarantined upload is unavailable.');
  } catch {
    return reject('The quarantined upload is unavailable.');
  }
  await new Promise<void>((resolve, rejectScan) => {
    execFile(
      scanner,
      ['-Scan', '-ScanType', '3', '-File', file, '-DisableRemediation'],
      { windowsHide: true, timeout: 45_000, maxBuffer: 64 * 1024 },
      (error) => {
        if (error) rejectScan(new Error('The malware scan failed closed.'));
        else resolve();
      },
    );
  });
}

async function main(): Promise<void> {
  const [, , file, format] = process.argv;
  if (!file || (format !== 'csv' && format !== 'xlsx'))
    throw new Error('Invalid parser invocation.');
  await scanFile(file);
  const rows = await parseUpload(await readFile(file), format);
  process.stdout.write(JSON.stringify(rows));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]).toLowerCase() : '';
if (invokedPath === fileURLToPath(import.meta.url).toLowerCase()) {
  void main().catch(() => {
    process.exitCode = 1;
  });
}
