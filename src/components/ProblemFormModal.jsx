import { useState } from 'react';
import PatternTagInput from './PatternTagInput';
import { STATUSES, STATUS_META } from '../constants/status';

const CATEGORY_SUGGESTIONS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
];

const emptyForm = {
  title: '',
  url: '',
  neetcodeCategory: '',
  patterns: [],
  status: null,
  recognitionNote: '',
};

export default function ProblemFormModal({ onClose, onSubmit, initial, availablePatterns, onCreatePattern }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title,
          url: initial.url,
          neetcodeCategory: initial.neetcodeCategory,
          patterns: initial.patterns,
          status: initial.status,
          recognitionNote: initial.recognitionNote || '',
        }
      : emptyForm
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit Problem' : 'Add Problem'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label>
            URL
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </label>
          <label>
            NeetCode Category
            <input
              list="category-suggestions"
              value={form.neetcodeCategory}
              onChange={(e) => setForm({ ...form, neetcodeCategory: e.target.value })}
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>
            Patterns
            <PatternTagInput
              value={form.patterns}
              onChange={(patterns) => setForm({ ...form, patterns })}
              availablePatterns={availablePatterns}
              onCreatePattern={onCreatePattern}
            />
          </label>
          <label>
            Status (leave unset for a new, untried problem)
            <div className="status-picker">
              {STATUSES.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`status-option ${form.status === s ? 'active' : ''}`}
                  style={{ '--status-color': STATUS_META[s].color, '--status-bg': STATUS_META[s].bg }}
                  onClick={() => setForm({ ...form, status: s })}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </label>
          <label>
            Recognition Note
            <input
              value={form.recognitionNote}
              onChange={(e) => setForm({ ...form, recognitionNote: e.target.value })}
              placeholder="I should recognize this needs X because Y"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initial ? 'Save' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
