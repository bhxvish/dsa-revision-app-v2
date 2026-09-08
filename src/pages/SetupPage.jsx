import { useEffect, useMemo, useState } from 'react';
import { NEETCODE_150 } from '../data/neetcode150';
import { listProblems, applySeedSelections } from '../data/repositories/problemsRepository';

function groupByCategory(list) {
  const map = new Map();
  list.forEach((p) => {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category).push(p);
  });
  return [...map.entries()].map(([category, items]) => ({ category, items }));
}

export default function SetupPage({ mode = 'first-launch', onComplete, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(false);

  const groups = useMemo(() => groupByCategory(NEETCODE_150), []);
  const total = NEETCODE_150.length;

  useEffect(() => {
    async function load() {
      const problems = await listProblems();
      const byTitle = new Map(problems.map((p) => [p.title.toLowerCase(), p]));
      const initial = new Set();
      NEETCODE_150.forEach((entry) => {
        const existing = byTitle.get(entry.title.toLowerCase());
        if (existing && existing.needsTriage !== false) {
          initial.add(entry.order);
        }
      });
      setSelected(initial);
      setLoading(false);
    }
    load();
  }, []);

  function toggleOne(order) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  }

  function toggleCategory(items, checked) {
    setSelected((prev) => {
      const next = new Set(prev);
      items.forEach((p) => {
        if (checked) next.add(p.order);
        else next.delete(p.order);
      });
      return next;
    });
  }

  function selectUpTo(order) {
    setSelected((prev) => {
      const next = new Set(prev);
      NEETCODE_150.forEach((p) => {
        if (p.order <= order) next.add(p.order);
      });
      return next;
    });
  }

  async function handleDone() {
    if (mode === 'rerun') {
      const ok = window.confirm(
        "This overwrites status and next-review-date for every NeetCode 150 problem based on the checkboxes below. Recognition notes, saved plans/code, and pattern templates are left untouched. Continue?"
      );
      if (!ok) return;
    }
    setSubmitting(true);
    const entries = NEETCODE_150.map((p) => ({
      title: p.title,
      url: p.url,
      category: p.category,
      pattern: p.pattern,
      order: p.order,
      checked: selected.has(p.order),
    }));
    await applySeedSelections(entries);
    setSubmitting(false);
    onComplete();
  }

  if (loading) {
    return <div className="page" />;
  }

  const selectedCount = selected.size;

  return (
    <div className="page setup-page">
      <div className="setup-header">
        <div>
          <h1>{mode === 'rerun' ? 'Re-run Setup' : 'Set up your NeetCode 150'}</h1>
          <p className="hint-text">
            Tick off what you've already solved. Checked problems land in your Quick Recall Check queue for
            triage; unchecked ones stay untried until you start them from the Problem List.
          </p>
        </div>
        <div className="setup-count">
          {selectedCount} / {total} selected
        </div>
      </div>

      {mode === 'rerun' && (
        <div className="setup-warning">
          Re-running setup overwrites status and next-review-date for every NeetCode 150 problem based on your
          checkboxes here. Recognition notes, saved plans/code, and pattern templates are never touched.
        </div>
      )}

      {total < 150 && (
        <div className="setup-warning setup-warning-info">
          Only {total} of 150 problems are loaded — paste the rest into src/data/neetcode150.js to unlock the full
          list.
        </div>
      )}

      <div className="setup-groups">
        {groups.map(({ category, items }) => {
          const allChecked = items.every((p) => selected.has(p.order));
          const someChecked = items.some((p) => selected.has(p.order));
          return (
            <div className="setup-category" key={category}>
              <div className="setup-category-header">
                <label className="setup-category-toggle">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked && !allChecked;
                    }}
                    onChange={(e) => toggleCategory(items, e.target.checked)}
                  />
                  <span>{category}</span>
                </label>
                <span className="hint-text">
                  {items.filter((p) => selected.has(p.order)).length}/{items.length}
                </span>
              </div>
              <div className="setup-rows">
                {items.map((p) => (
                  <div className="setup-row" key={p.order}>
                    <input type="checkbox" checked={selected.has(p.order)} onChange={() => toggleOne(p.order)} />
                    <span className="setup-row-order">{p.order}</span>
                    <a href={p.url} target="_blank" rel="noreferrer" className="setup-row-title">
                      {p.title}
                    </a>
                    <span className="tag-chip-sm">{p.pattern}</span>
                    <button type="button" className="btn-link setup-row-upto" onClick={() => selectUpTo(p.order)}>
                      Select up to here
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="setup-footer">
        {mode === 'rerun' && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="button" className="btn-primary" onClick={handleDone} disabled={submitting}>
          Done
        </button>
      </div>
    </div>
  );
}
