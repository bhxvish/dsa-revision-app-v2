import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProblem } from '../data/repositories/problemsRepository';
import { getSettings, updateSettings } from '../data/repositories/settingsRepository';
import PracticeSession from '../components/PracticeSession';

export default function PracticeViewPage() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [settings, setSettings] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      const [p, s] = await Promise.all([getProblem(problemId), getSettings()]);
      setProblem(p);
      setSettings(s);
    }
    load();
  }, [problemId]);

  async function handleTimerMinutesChange(value) {
    const n = Math.max(1, parseInt(value, 10) || 1);
    setSettings(await updateSettings({ struggleTimerMinutes: n }));
  }

  if (!problem || !settings) {
    return <div className="page" />;
  }

  if (done) {
    return (
      <div className="page recall-page">
        <div className="recall-empty">
          <h1>Saved</h1>
          <p>Nice work on &quot;{problem.title}&quot;.</p>
          <Link to="/problems" className="btn-primary">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page recall-page">
      <div className="recall-header">
        <h1>Practice</h1>
        <label className="redq-settings">
          Timer (min)
          <input
            type="number"
            min="1"
            value={settings.struggleTimerMinutes}
            onChange={(e) => handleTimerMinutesChange(e.target.value)}
          />
        </label>
      </div>

      <PracticeSession
        key={problem.id}
        mode="new"
        problem={problem}
        struggleMinutes={settings.struggleTimerMinutes}
        onComplete={() => setDone(true)}
      />
    </div>
  );
}
