import { STATUS_META } from '../constants/status';

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.unrated;
  return (
    <span
      className="status-badge"
      style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
    >
      {meta.label}
    </span>
  );
}
