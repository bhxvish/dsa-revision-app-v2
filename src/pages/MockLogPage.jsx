import { useEffect, useState } from 'react';
import { listProblems, createProblem } from '../data/repositories/problemsRepository';
import { listPatterns, addPattern } from '../data/repositories/patternsRepository';
import { listMockSessions, createMockSession } from '../data/repositories/mockSessionsRepository';
import MockSessionModal from '../components/MockSessionModal';

export default function MockLogPage() {
  const [problems, setProblems] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  async function refresh() {
    const [p, pat, s] = await Promise.all([listProblems(), listPatterns(), listMockSessions()]);
    setProblems(p);
    setPatterns(pat);
    setSessions(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreatePattern(name) {
    setPatterns(await addPattern(name));
  }

  async function handleLogSession({ date, durationMinutes, rows }) {
    const problemEntries = [];
    for (const row of rows) {
      const title = row.title.trim();
      const existing = problems.find((p) => p.title.toLowerCase() === title.toLowerCase());
      let problemId;
      let canonicalTitle;
      if (existing) {
        problemId = existing.id;
        canonicalTitle = existing.title;
      } else {
        const created = await createProblem({ title, patterns: row.pattern ? [row.pattern] : [] });
        problemId = created.id;
        canonicalTitle = created.title;
      }
      problemEntries.push({
        problemId,
        title: canonicalTitle,
        pattern: row.pattern.trim(),
        solved: row.solved,
        notes: row.notes.trim(),
      });
    }
    await createMockSession({ date, durationMinutes, problems: problemEntries });
    setModalOpen(false);
    refresh();
  }

  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mock Test Log</h1>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Log Session
        </button>
      </div>

      {sortedSessions.length === 0 ? (
        <p className="hint-text">No mock sessions logged yet.</p>
      ) : (
        <div className="mock-session-list">
          {sortedSessions.map((s) => {
            const solvedCount = s.problems.filter((p) => p.solved).length;
            return (
              <div className="mock-session-card" key={s.id}>
                <div className="mock-session-header">
                  <span className="mock-session-date">{s.date}</span>
                  <span className="hint-text">{s.durationMinutes} min</span>
                  <span className="mock-session-score">
                    {solvedCount}/{s.problems.length} solved
                  </span>
                </div>
                <div className="mock-session-problems">
                  {s.problems.map((p, i) => (
                    <div className="mock-session-problem" key={i}>
                      <span className={`mock-solved-dot ${p.solved ? 'solved' : 'failed'}`} />
                      <span className="mock-problem-title">{p.title}</span>
                      {p.pattern && <span className="tag-chip-sm">{p.pattern}</span>}
                      {p.notes && <span className="hint-text">{p.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <MockSessionModal
          problems={problems}
          patterns={patterns}
          onCreatePattern={handleCreatePattern}
          onClose={() => setModalOpen(false)}
          onSubmit={handleLogSession}
        />
      )}
    </div>
  );
}
