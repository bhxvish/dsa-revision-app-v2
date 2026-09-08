import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProblems } from '../data/repositories/problemsRepository';
import { listPatterns } from '../data/repositories/patternsRepository';

export default function NotesPage() {
  const [problems, setProblems] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [patternFilter, setPatternFilter] = useState('all');

  async function refresh() {
    const [p, pat] = await Promise.all([listProblems(), listPatterns()]);
    setProblems(p);
    setPatterns(pat);
  }

  useEffect(() => {
    refresh();
  }, []);

  const noted = useMemo(() => {
    return problems
      .filter((p) => p.recognitionNote?.trim())
      .filter((p) => patternFilter === 'all' || p.patterns.includes(patternFilter))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [problems, patternFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notes</h1>
      </div>

      <div className="toolbar">
        <select value={patternFilter} onChange={(e) => setPatternFilter(e.target.value)}>
          <option value="all">All patterns</option>
          {patterns.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {noted.length === 0 ? (
        <p className="hint-text">
          No recognition notes yet. They're captured every time you submit a practice session.
        </p>
      ) : (
        <div className="notes-list">
          {noted.map((p) => (
            <div className="notes-row" key={p.id}>
              <div className="notes-row-header">
                <span className="notes-row-title">{p.title}</span>
                <div className="pattern-chips">
                  {p.patterns.map((tag) => (
                    <Link key={tag} to={`/templates/${encodeURIComponent(tag)}`} className="tag-chip-sm tag-chip-link">
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              <p className="notes-row-text">{p.recognitionNote}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
