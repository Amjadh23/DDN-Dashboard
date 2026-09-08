import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Halaman tidak ditemui</h1>
      <p>Pautan ini tidak tersedia dalam ruang V1.</p>
      <Link href="/" className="button button-primary">
        Kembali ke gambaran nasional
      </Link>
    </div>
  );
}
