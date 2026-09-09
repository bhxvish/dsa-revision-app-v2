import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProblems } from '../data/repositories/problemsRepository';
import { listMockSessions } from '../data/repositories/mockSessionsRepository';
import { getRedQueueProgress } from '../data/repositories/redQueueRepository';
import { getSettings, updateSettings } from '../data/repositories/settingsRepository';
import { getTodayHours, setTodayHours } from '../data/repositories/timeBudgetRepository';
import { getDueProblems, getRedBacklog, isDue, todayISO } from '../data/scheduling';
import { computePatternScores, getWeaknessRank } from '../data/analytics';
import { computeSplit, formatMinutes } from '../data/timeBudget';

const SPLIT_FIELDS = [
  { key: 'newProblems', label: 'New' },
  { key: 'redQueue', label: 'Red' },
  { key: 'dueReviews', label: 'Reviews' },
];

export default function DashboardPage() {
  const [problems, setProblems] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [redProgress, setRedProgress] = useState(null);
  const [settings, setSettings] = useState(null);
  const [hours, setHours] = useState(null);

  async function refresh() {
    const [p, s, rp, st, h] = await Promise.all([
      listProblems(),
      listMockSessions(),
      getRedQueueProgress(),
      getSettings(),
      getTodayHours(),
    ]);
    setProblems(p);
    setSessions(s);
    setRedProgress(rp);
    setSettings(st);
    setHours(h);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleHoursChange(value) {
    const n = value === '' ? null : Math.max(0, parseFloat(value) || 0);
    setHours(n);
    await setTodayHours(n);
  }

  async function handleSplitChange(key, value) {
    const n = Math.max(0, parseInt(value, 10) || 0);
    // Read the freshest persisted split rather than the (possibly stale)
    // React state, so rapid edits to different fields don't clobber each other.
    const latest = await getSettings();
    const nextSplit = { ...latest.timeSplit, [key]: n };
    setSettings(await updateSettings({ timeSplit: nextSplit }));
  }

  if (!problems || !sessions || !redProgress || !settings) {
    return <div className="page" />;
  }

  const dueCount = getDueProblems(problems).length;
  const practiceQueueCount = getRedBacklog(problems).length;

  const redQuota = settings.redsPerDay + redProgress.extraAllowed;
  const redClearedCount = redProgress.clearedIds.length;

  const patternScores = computePatternScores(problems, sessions);
  const weakest = patternScores.slice(0, 3);

  // Exclude anything already sitting in the due/triage queue — a problem
  // marked "already solved" during NeetCode 150 setup (or bulk-triaged) is
  // due for Quick Recall, not a "new problem" suggestion.
  const unratedProblems = problems.filter((p) => !p.status && !isDue(p));
  const suggested = [...unratedProblems].sort(
    (a, b) => getWeaknessRank(patternScores, a.patterns) - getWeaknessRank(patternScores, b.patterns)
  )[0];

  const split = hours ? computeSplit(hours, settings.timeSplit) : null;

  const today = todayISO();
  const statusCounts = { unrated: 0, red: 0, yellow: 0, green: 0 };
  problems.forEach((p) => {
    statusCounts[p.status || 'unrated'] += 1;
  });
  const reviewedToday = problems.filter((p) => p.lastReviewed === today).length;
  const lastMock = [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>

      <section className="dash-section">
        <h2>Time budget</h2>
        <div className="time-budget-input">
          <label>
            Hours available today
            <input
              type="number"
              min="0"
              step="0.5"
              value={hours ?? ''}
              onChange={(e) => handleHoursChange(e.target.value)}
              placeholder="e.g. 2"
            />
          </label>
        </div>

        {split && (
          <div className="split-cards">
            <Link to={suggested ? `/practice/${suggested.id}` : '/problems?status=unrated'} className="split-card">
              <span className="split-card-label">New problems</span>
              <span className="split-card-time">{formatMinutes(split.newProblems)}</span>
            </Link>
            <Link to="/red-queue" className="split-card">
              <span className="split-card-label">Red Queue</span>
              <span className="split-card-time">{formatMinutes(split.redQueue)}</span>
            </Link>
            <Link to="/recall" className="split-card">
              <span className="split-card-label">Due reviews</span>
              <span className="split-card-time">{formatMinutes(split.dueReviews)}</span>
            </Link>
          </div>
        )}

        <div className="split-editor">
          <span className="hint-text">Split</span>
          {SPLIT_FIELDS.map((f) => (
            <label key={f.key}>
              {f.label}
              <input
                type="number"
                min="0"
                value={settings.timeSplit[f.key]}
                onChange={(e) => handleSplitChange(f.key, e.target.value)}
              />
              %
            </label>
          ))}
        </div>
      </section>

      <section className="dash-section">
        <h2>Today's snapshot</h2>
        <div className="snapshot-grid">
          <Link to="/recall" className="snapshot-card">
            <span className="snapshot-count">{dueCount}</span>
            <span className="snapshot-label">due for review</span>
          </Link>
          <Link to="/red-queue" className="snapshot-card">
            <span className="snapshot-count">{practiceQueueCount}</span>
            <span className="snapshot-label">in practice queue</span>
          </Link>
          <Link to="/red-queue" className="snapshot-card">
            <span className="snapshot-count">
              {redClearedCount}/{redQuota}
            </span>
            <span className="snapshot-label">red queue cleared today</span>
          </Link>
          <div className="snapshot-card snapshot-card-wide">
            <span className="snapshot-label">Weakest patterns</span>
            {weakest.length === 0 ? (
              <span className="hint-text">Not enough data yet.</span>
            ) : (
              <div className="weak-chip-row">
                {weakest.map((s) => (
                  <Link
                    key={s.pattern}
                    to={`/problems?pattern=${encodeURIComponent(s.pattern)}&status=unrated`}
                    className="weak-chip"
                  >
                    {s.pattern} <strong>{Math.round(s.score * 100)}%</strong>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="new-suggestion">
          {suggested ? (
            <Link to={`/practice/${suggested.id}`} className="btn-primary">
              Start a new problem: {suggested.title}
              {suggested.patterns[0] ? ` (${suggested.patterns[0]})` : ''}
            </Link>
          ) : (
            <span className="hint-text">No untried problems left — add more from the Problem List.</span>
          )}
        </div>
      </section>

      <section className="dash-section">
        <h2>Progress</h2>
        <div className="progress-grid">
          <div className="progress-stat">
            <span className="progress-stat-value">{problems.length}</span>
            <span className="progress-stat-label">tracked</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value" style={{ color: 'var(--status-green)' }}>
              {statusCounts.green}
            </span>
            <span className="progress-stat-label">green</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value" style={{ color: 'var(--status-yellow)' }}>
              {statusCounts.yellow}
            </span>
            <span className="progress-stat-label">yellow</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value" style={{ color: 'var(--status-red)' }}>
              {statusCounts.red}
            </span>
            <span className="progress-stat-label">red</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{reviewedToday}</span>
            <span className="progress-stat-label">reviewed today</span>
          </div>
          <div className="progress-stat">
            <span className="progress-stat-value">{lastMock ? lastMock.date : '—'}</span>
            <span className="progress-stat-label">last mock session</span>
          </div>
        </div>
      </section>

      <section className="dash-section">
        <h2>Jump to</h2>
        <div className="jump-links">
          <Link to="/problems" className="btn-secondary">
            Problem List
          </Link>
          <Link to="/recall" className="btn-secondary">
            Quick Recall Check
          </Link>
          <Link to="/red-queue" className="btn-secondary">
            Red Queue
          </Link>
          <Link to="/templates" className="btn-secondary">
            Pattern Library
          </Link>
          <Link to="/notes" className="btn-secondary">
            Notes
          </Link>
          <Link to="/mock-log" className="btn-secondary">
            Mock Test Log
          </Link>
          <Link to="/analytics" className="btn-secondary">
            Analytics
          </Link>
        </div>
      </section>
    </div>
  );
}
