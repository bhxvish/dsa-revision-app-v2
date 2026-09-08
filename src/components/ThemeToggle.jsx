import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, setStoredTheme, systemPrefersDark } from '../theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getStoredTheme() || (systemPrefersDark() ? 'dark' : 'light'));

  // Keep the icon in sync if the OS theme changes while no explicit choice is stored.
  useEffect(() => {
    if (getStoredTheme()) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
