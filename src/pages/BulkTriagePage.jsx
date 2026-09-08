import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProblemsBulk, updateProblem } from '../data/repositories/problemsRepository';
import { listPatterns, addPattern } from '../data/repositories/patternsRepository';
import PatternTagInput from '../components/PatternTagInput';

function parseLines(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const commaIdx = line.indexOf(',');
      if (commaIdx === -1) return { title: line, url: '' };
      return {
        title: line.slice(0, commaIdx).trim(),
        url: line.slice(commaIdx + 1).trim(),
      };
    });
}

export default function BulkTriagePage() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState('');
  const [created, setCreated] = useState(null); // null = still in input stage
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    listPatterns().then(setPatterns);
  }, []);

  async function handleParse(e) {
    e.preventDefault();
    const entries = parseLines(raw);
    if (entries.length === 0) return;
    const problems = await createProblemsBulk(entries);
    setCreated(problems);
  }

  async function handleCreatePattern(name) {
    setPatterns(await addPattern(name));
  }

  async function handlePatternsChange(id, newPatterns) {
    setCreated((prev) => prev.map((p) => (p.id === id ? { ...p, patterns: newPatterns } : p)));
    await updateProblem(id, { patterns: newPatterns });
  }

  if (created === null) {
    return (
      <div className="page">
        <h1>Bulk Add &amp; Triage</h1>
        <p className="hint-text">
          Paste problem titles, one per line. Optionally add a link with "Title, https://...".
        </p>
        <form onSubmit={handleParse} className="bulk-form">
          <textarea
            className="bulk-textarea"
            rows={12}
            placeholder={'Container With Most Water\nValid Parentheses, https://leetcode.com/problems/valid-parentheses/'}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={!raw.trim()}>
            Add Problems
          </button>
        </form>
      </div>
    );
  }

  const untagged = created.filter((p) => p.patterns.length === 0).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tag Patterns</h1>
        <span className="recall-remaining">{created.length} added</span>
      </div>
      <p className="hint-text">
        Assign at least one pattern to each problem, then send them into Quick Recall Check to triage.
      </p>

      <div className="triage-table">
        {created.map((p) => (
          <div className="triage-row" key={p.id}>
            <span className="triage-title">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.title}
                </a>
              ) : (
                p.title
              )}
            </span>
            <PatternTagInput
              value={p.patterns}
              onChange={(next) => handlePatternsChange(p.id, next)}
              availablePatterns={patterns}
              onCreatePattern={handleCreatePattern}
            />
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button
          className="btn-primary"
          disabled={untagged > 0}
          onClick={() => navigate('/recall')}
        >
          {untagged > 0 ? `Tag ${untagged} more to continue` : 'Start Quick Recall Check'}
        </button>
      </div>
    </div>
  );
}
