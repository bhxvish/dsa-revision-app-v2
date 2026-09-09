import { useEffect, useState } from 'react';
import { listProblems } from '../data/repositories/problemsRepository';
import { getRedQueueProgress, markRedCleared, pullExtraRed } from '../data/repositories/redQueueRepository';
import { getSettings, updateSettings } from '../data/repositories/settingsRepository';
import { getRedBacklog, getYellowBacklog } from '../data/scheduling';
import PracticeSession from '../components/PracticeSession';

export default function RedQueuePage() {
  const [problems, setProblems] = useState(null);
  const [progress, setProgress] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const [p, prog, s] = await Promise.all([listProblems(), getRedQueueProgress(), getSettings()]);
    setProblems(p);
    setProgress(prog);
    setSettings(s);
  }

  if (!problems || !progress || !settings) {
    return <div className="page" />;
  }

  const includeYellows = settings.redQueueIncludeYellows;
  const redBacklog = getRedBacklog(problems);
  const yellowBacklog = includeYellows ? getYellowBacklog(problems) : [];
  // Reds always sort ahead of yellows since they're listed first here.
  const backlog = [...redBacklog, ...yellowBacklog];
  const remaining = backlog.filter((p) => !progress.clearedIds.includes(p.id));
  const quota = settings.redsPerDay + progress.extraAllowed;
  const clearedCount = progress.clearedIds.length;

  const showNoBacklog = backlog.length === 0;
  const showAllCaughtUp = !showNoBacklog && remaining.length === 0;
  const showDoneForToday = !showNoBacklog && !showAllCaughtUp && clearedCount >= quota;
  const current = !showNoBacklog && !showAllCaughtUp && !showDoneForToday ? remaining[0] : null;

  const pageTitle = includeYellows ? 'Practice Queue' : 'Red Queue';

  async function handleRedsPerDayChange(value) {
    const n = Math.max(1, parseInt(value, 10) || 1);
    setSettings(await updateSettings({ redsPerDay: n }));
  }

  async function handleIncludeYellowsChange(checked) {
    setSettings(await updateSettings({ redQueueIncludeYellows: checked }));
  }

  async function handlePullExtra() {
    setProgress(await pullExtraRed());
  }

  async function handleComplete(problemId) {
    await markRedCleared(problemId);
    await refresh();
  }

  return (
    <div className="page recall-page">
      <div className="recall-header">
        <h1>{pageTitle}</h1>
        <div className="redq-header-controls">
          <label className="redq-yellow-toggle">
            <input
              type="checkbox"
              checked={includeYellows}
              onChange={(e) => handleIncludeYellowsChange(e.target.checked)}
            />
            Include yellows
          </label>
          <label className="redq-settings">
            Reds/day
            <input
              type="number"
              min="1"
              value={settings.redsPerDay}
              onChange={(e) => handleRedsPerDayChange(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="redq-stats">
        Cleared <strong>{clearedCount}</strong> today &middot;{' '}
        {includeYellows ? (
          <>
            <strong>{redBacklog.length}</strong> reds, <strong>{yellowBacklog.length}</strong> yellows remaining
          </>
        ) : (
          <>
            <strong>{redBacklog.length}</strong> reds remaining overall
          </>
        )}
      </div>

      {showNoBacklog && (
        <div className="recall-empty">
          <h1>{includeYellows ? 'No red or yellow problems right now' : 'No red problems right now'}</h1>
          <p>Nothing needs re-learning today. Nice work.</p>
        </div>
      )}

      {showAllCaughtUp && (
        <div className="recall-empty">
          <h1>All caught up</h1>
          <p>You've worked through every {includeYellows ? 'problem' : 'red problem'} in the backlog.</p>
        </div>
      )}

      {showDoneForToday && (
        <div className="recall-empty">
          <h1>Done for today</h1>
          <p>
            You've cleared today's {includeYellows ? 'practice queue' : 'red queue'} ({clearedCount}/{quota}).
          </p>
          <button className="btn-secondary" onClick={handlePullExtra}>
            Pull one more
          </button>
        </div>
      )}

      {current && (
        <PracticeSession key={current.id} mode="red" problem={current} onComplete={() => handleComplete(current.id)} />
      )}
    </div>
  );
}
