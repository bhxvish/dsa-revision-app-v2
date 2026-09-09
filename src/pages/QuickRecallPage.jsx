import { useEffect, useState } from 'react';
import { listDueProblems, reviewProblem } from '../data/repositories/problemsRepository';
import ReviewTimer from '../components/ReviewTimer';
import PracticeSession from '../components/PracticeSession';

const RATINGS = [
  { status: 'green', label: 'Got it' },
  { status: 'yellow', label: 'Blurry' },
  { status: 'red', label: 'Blank' },
];

export default function QuickRecallPage() {
  const [due, setDue] = useState(null); // null = loading
  const [rating, setRating] = useState(false);
  // The problem + rating just given, when it was Blurry/Blank — offers an
  // optional "Practice now" without disturbing the auto-advance that already
  // happened. Cleared on a "Got it" rating, on starting practice, or by the
  // next rating overwriting it.
  const [lastRated, setLastRated] = useState(null);
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setDue(await listDueProblems());
  }

  async function handleRate(status) {
    if (!due?.length || rating) return;
    setRating(true);
    const ratedProblem = due[0];
    await reviewProblem(ratedProblem.id, status);
    setLastRated(status === 'green' ? null : { problem: ratedProblem, status });
    await refresh();
    setRating(false);
  }

  async function handlePracticeComplete() {
    setPracticing(false);
    setLastRated(null);
    await refresh();
  }

  if (due === null) {
    return <div className="page" />;
  }

  if (practicing && lastRated) {
    return (
      <div className="page recall-page">
        <div className="recall-header">
          <h1>Quick Recall Check</h1>
          <span className="recall-remaining">{due.length} due</span>
        </div>
        <PracticeSession
          key={lastRated.problem.id}
          mode="red"
          problem={lastRated.problem}
          onComplete={handlePracticeComplete}
        />
      </div>
    );
  }

  const practiceBanner = lastRated && (
    <div className="recall-practice-banner">
      <span>
        Rated <strong>{RATINGS.find((r) => r.status === lastRated.status)?.label}</strong> —{' '}
        {lastRated.problem.title}.
      </span>
      <button type="button" className="btn-secondary" onClick={() => setPracticing(true)}>
        Practice now
      </button>
    </div>
  );

  if (due.length === 0) {
    return (
      <div className="page recall-page">
        <div className="recall-empty">
          <h1>Nothing due today</h1>
          <p>You're all caught up. Check back tomorrow, or add more problems to review.</p>
        </div>
        {practiceBanner}
      </div>
    );
  }

  const current = due[0];

  return (
    <div className="page recall-page">
      <div className="recall-header">
        <h1>Quick Recall Check</h1>
        <span className="recall-remaining">{due.length} due</span>
      </div>

      <div className="recall-card" key={current.id}>
        <ReviewTimer />
        <div className="recall-card-body">
          <h2 className="recall-title">
            {current.url ? (
              <a href={current.url} target="_blank" rel="noreferrer">
                {current.title}
              </a>
            ) : (
              current.title
            )}
          </h2>
          <div className="pattern-chips recall-patterns">
            {current.patterns.length === 0 && <span className="tag-chip-sm tag-chip-empty">No pattern tagged</span>}
            {current.patterns.map((tag) => (
              <span key={tag} className="tag-chip-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="recall-actions">
          {RATINGS.map((r) => (
            <button
              key={r.status}
              disabled={rating}
              className={`recall-btn recall-btn-${r.status}`}
              onClick={() => handleRate(r.status)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {practiceBanner}
    </div>
  );
}
