'use client';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="page-content">
      <div className="empty-state">
        <h1>Ruang data belum tersedia</h1>
        <p>
          Sambungan atau sesi tidak dapat disahkan. Tiada nilai gantian dipaparkan. Pastikan
          pangkalan data setempat berjalan dan sesi demo masih sah.
        </p>
        <button className="button button-primary" onClick={() => reset()}>
          Cuba semula
        </button>
      </div>
    </div>
  );
}
