export const STATUSES = ['red', 'yellow', 'green'];

// Colors are CSS custom properties defined once in index.css, so JS (inline
// styles) and plain CSS never drift out of sync.
export const STATUS_META = {
  red: { label: 'Red', color: 'var(--status-red)', bg: 'var(--status-red-bg)', border: 'var(--status-red-border)' },
  yellow: {
    label: 'Yellow',
    color: 'var(--status-yellow)',
    bg: 'var(--status-yellow-bg)',
    border: 'var(--status-yellow-border)',
  },
  green: {
    label: 'Green',
    color: 'var(--status-green)',
    bg: 'var(--status-green-bg)',
    border: 'var(--status-green-border)',
  },
  unrated: {
    label: 'New',
    color: 'var(--status-unrated)',
    bg: 'var(--status-unrated-bg)',
    border: 'var(--status-unrated-border)',
  },
};
