'use client';
import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react';

/** Presentation pagination only; data remains scoped by the existing server DAL. */
export function RecordList({
  children,
  label,
  size = 5,
  className = '',
  hashPaging = false,
}: {
  children: ReactNode;
  label: string;
  size?: number;
  className?: string;
  hashPaging?: boolean;
}) {
  const rows = Children.toArray(children);
  const [page, setPage] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages - 1);
  useEffect(() => {
    if (!hashPaging) return;
    const reveal = () => {
      const hash = decodeURIComponent(location.hash.slice(1));
      const index = Children.toArray(children).findIndex(
        (child) => isValidElement<{ id?: string }>(child) && child.props.id === hash,
      );
      if (index >= 0) setPage(Math.floor(index / size));
    };
    const frame = requestAnimationFrame(reveal);
    window.addEventListener('hashchange', reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', reveal);
    };
  }, [children, hashPaging, size]);
  function move(next: number) {
    setPage(next);
    root.current?.focus({ preventScroll: true });
    root.current?.scrollIntoView({ block: 'nearest' });
  }
  return (
    <div ref={root} tabIndex={-1} aria-label={label}>
      <div className={className}>{rows.slice(current * size, (current + 1) * size)}</div>
      {pages > 1 && (
        <nav className="list-pagination" aria-label={`Halaman ${label}`}>
          <button
            className="button button-secondary"
            disabled={current === 0}
            onClick={() => move(current - 1)}
          >
            Sebelumnya
          </button>
          <span role="status">
            {current * size + 1}–{Math.min((current + 1) * size, rows.length)} daripada{' '}
            {rows.length}
          </span>
          <button
            className="button button-secondary"
            disabled={current === pages - 1}
            onClick={() => move(current + 1)}
          >
            Seterusnya
          </button>
        </nav>
      )}
    </div>
  );
}
