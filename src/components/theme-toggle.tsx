'use client';
import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

type Mode = 'light' | 'dark';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  return () => {
    observer.disconnect();
  };
}
function currentMode(): Mode {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return 'light';
}

// The choice is kept in a preference cookie so the server renders the right mode
// on the next request; no browser storage is used.
export function ThemeToggle({ initialMode }: { initialMode: Mode }) {
  const mode = useSyncExternalStore<Mode>(subscribe, currentMode, () => initialMode);
  function toggle() {
    const next: Mode = currentMode() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.cookie = `ddn-theme=${next}; path=/; max-age=31536000; samesite=lax`;
  }
  const label = mode === 'dark' ? 'Tukar ke mod cerah' : 'Tukar ke mod gelap';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-mode={mode ?? undefined}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun size={15} className="theme-toggle-sun" />
        <Moon size={15} className="theme-toggle-moon" />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
