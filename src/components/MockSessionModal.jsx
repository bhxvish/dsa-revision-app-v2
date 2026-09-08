import { useState } from 'react';
import { todayISO } from '../data/scheduling';

function emptyRow() {
  return { key: crypto.randomUUID(), title: '', pattern: '', solved: false, notes: '' };
}

export default function MockSessionModal({ problems, patterns, onCreatePattern, onClose, onSubmit }) {
  const [date, setDate] = useState(todayISO());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [rows, setRows] = useState([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(key, patch) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(key) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handlePatternBlur(row) {
    const trimmed = row.pattern.trim();
    if (trimmed && !patterns.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      await onCreatePattern(trimmed);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validRows = rows.filter((r) => r.title.trim());
    if (validRows.length === 0 || submitting) return;
    setSubmitting(true);
    await onSubmit({ date, durationMinutes: Number(durationMinutes) || 0, rows: validRows });
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal modal-wide" onMouseDown={(e) => e.stopPropagation()}>
        <h2>Log Mock Session</h2>
        <form onSubmit={handleSubmit}>
          <div className="mock-form-header">
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Duration (min)
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="mock-rows">
            <div className="mock-row mock-row-header">
              <span>Problem</span>
              <span>Pattern</span>
              <span>Solved</span>
              <span>Notes</span>
              <span />
            </div>
            {rows.map((row) => (
              <div className="mock-row" key={row.key}>
                <input
                  className="mock-row-title"
                  list="mock-existing-problems"
                  placeholder="Existing or new title..."
                  value={row.title}
                  onChange={(e) => updateRow(row.key, { title: e.target.value })}
                />
                <input
                  className="mock-row-pattern"
                  list="mock-pattern-options"
                  placeholder="Pattern"
                  value={row.pattern}
                  onChange={(e) => updateRow(row.key, { pattern: e.target.value })}
                  onBlur={() => handlePatternBlur(row)}
                />
                <input
                  type="checkbox"
                  className="mock-row-solved"
                  checked={row.solved}
                  onChange={(e) => updateRow(row.key, { solved: e.target.checked })}
                />
                <input
                  className="mock-row-notes"
                  placeholder="Optional"
                  value={row.notes}
                  onChange={(e) => updateRow(row.key, { notes: e.target.value })}
                />
                <button
                  type="button"
                  className="btn-link btn-danger"
                  onClick={() => removeRow(row.key)}
                  disabled={rows.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <datalist id="mock-existing-problems">
            {problems.map((p) => (
              <option key={p.id} value={p.title} />
            ))}
          </datalist>
          <datalist id="mock-pattern-options">
            {patterns.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>

          <button type="button" className="btn-secondary" onClick={addRow}>
            + Add problem
          </button>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              Log Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
