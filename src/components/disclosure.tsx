'use client';
import { useEffect, useRef, type ReactNode } from 'react';

/** Native disclosure retains keyboard support, server-rendered content and deep links. */
export function Disclosure({
  title,
  children,
  id,
  open = false,
  meta,
}: {
  title: string;
  children: ReactNode;
  id?: string;
  open?: boolean;
  meta?: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const reveal = () => {
      if (id && decodeURIComponent(location.hash.slice(1)) === id && ref.current) {
        ref.current.open = true;
        ref.current.scrollIntoView({ block: 'start' });
      }
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, [id]);
  return (
    <details className="disclosure" ref={ref} id={id} open={open}>
      <summary>
        <span className="disclosure-title">{title}</span>
        {meta && <span className="disclosure-meta">{meta}</span>}
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
