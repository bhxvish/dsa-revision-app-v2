import { useEffect, useState } from 'react';
import { listDueProblems, reviewProblem } from '../data/repositories/problemsRepository';
import ReviewTimer from '../components/ReviewTimer';

const RATINGS = [
  { status: 'green', label: 'Got it' },
  { status: 'yellow', label: 'Blurry' },
  { status: 'red', label: 'Blank' },
];

export default function QuickRecallPage() {
  const [due, setDue] = useState(null); // null = loading
  const [rating, setRating] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setDue(await listDueProblems());
  }

  async function handleRate(status) {
    if (!due?.length || rating) return;
    setRating(true);
    await reviewProblem(due[0].id, status);
    await refresh();
    setRating(false);
  }

  if (due === null) {
    return <div className="page" />;
  }

  if (due.length === 0) {
    return (
      <div className="page recall-page">
        <div className="recall-empty">
          <h1>Nothing due today</h1>
          <p>You're all caught up. Check back tomorrow, or add more problems to review.</p>
        </div>
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
    </div>
  );
}
