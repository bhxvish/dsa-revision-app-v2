import { useEffect, useState } from 'react';
import { listProblems } from '../data/repositories/problemsRepository';
import { listMockSessions } from '../data/repositories/mockSessionsRepository';
import { computePatternScores, computeWeeklyTrend } from '../data/analytics';

export default function AnalyticsPage() {
  const [problems, setProblems] = useState(null);
  const [sessions, setSessions] = useState(null);

  async function refresh() {
    const [p, s] = await Promise.all([listProblems(), listMockSessions()]);
    setProblems(p);
    setSessions(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (problems === null || sessions === null) {
    return <div className="page" />;
  }

  const scores = computePatternScores(problems, sessions);
  const weakest = scores.slice(0, 3);
  const trend = computeWeeklyTrend(sessions, scores.map((s) => s.pattern));

  return (
    <div className="page">
      <h1>Analytics</h1>

      {scores.length === 0 ? (
        <p className="hint-text">
          No data yet. Review some problems or log a mock session to see pattern analytics.
        </p>
      ) : (
        <>
          <div className="weak-callout">
            <h2>Weakest patterns</h2>
            <div className="weak-callout-list">
              {weakest.map((s) => (
                <div className="weak-callout-item" key={s.pattern}>
                  <span className="weak-callout-pattern">{s.pattern}</span>
                  <span className="weak-callout-score">{Math.round(s.score * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className="section-spacer">All patterns, weakest to strongest</h2>
          <div className="score-table">
            <div className="score-row score-row-header">
              <span>Pattern</span>
              <span>Mock</span>
              <span>Quick Recall</span>
              <span>Score</span>
            </div>
            {scores.map((s) => (
              <div className="score-row" key={s.pattern}>
                <span>{s.pattern}</span>
                <span>{s.mockRate !== null ? `${s.mockSolved}/${s.mockTotal}` : '—'}</span>
                <span>{s.statusRate !== null ? `${s.statusGreen}/${s.statusTotal}` : '—'}</span>
                <span>{Math.round(s.score * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-spacer">Trend by week</h2>
      {sessions.length < 2 ? (
        <p className="hint-text">Not enough mock sessions yet to show a trend.</p>
      ) : (
        <div className="trend-table-wrap">
          <table className="trend-table">
            <thead>
              <tr>
                <th>Pattern</th>
                {trend.weeks.map((w) => (
                  <th key={w}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trend.rows.map((row) => (
                <tr key={row.pattern}>
                  <td>{row.pattern}</td>
                  {row.cells.map((cell, i) => (
                    <td key={i}>{cell ? `${cell.solved}/${cell.total}` : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
