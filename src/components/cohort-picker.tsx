'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
export function CohortPicker({ value }: { value: string }) {
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  return (
    <label className="inline-field">
      Kohort contoh
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(params);
          p.set('cohort', e.target.value);
          router.replace(`${path}?${p}`, { scroll: false });
        }}
      >
        <option value="2026-q1">2026 · suku 1</option>
        <option value="2025-q4">2025 · suku 4</option>
      </select>
    </label>
  );
}
