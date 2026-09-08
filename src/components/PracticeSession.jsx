import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { updateProblem, reviewProblem } from '../data/repositories/problemsRepository';

const RATINGS = [
  { status: 'green', label: 'Got it' },
  { status: 'yellow', label: 'Blurry' },
  { status: 'red', label: 'Still lost' },
];

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Two entry modes:
//  - "new": untried problem. Struggle timer gates the hint area; solving with
//    zero hint reveals skips rating and goes straight to green.
//  - "red": red-queue re-attempt. No timer — hint/notes area is visible immediately.
export default function PracticeSession({ mode, problem, struggleMinutes = 25, onComplete }) {
  const isNew = mode === 'new';
  const [step, setStep] = useState('working'); // 'working' | 'note' | 'rating'
  const [plan, setPlan] = useState(problem.planText || '');
  const [code, setCode] = useState(problem.codeText || '');
  const [hintNotes, setHintNotes] = useState('');
  const [hintRevealed, setHintRevealed] = useState(!isNew);
  const [revealedEarly, setRevealedEarly] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(isNew ? struggleMinutes * 60 : 0);
  const [note, setNote] = useState(problem.recognitionNote || '');
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(false);

  useEffect(() => {
    if (!isNew || hintRevealed || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [isNew, hintRevealed, secondsLeft]);

  function handleReveal() {
    setHintRevealed(true);
  }

  function handleEndEarly() {
    setRevealedEarly(true);
    setHintRevealed(true);
  }

  async function handleSubmitWork(e) {
    e.preventDefault();
    setSubmitting(true);
    const patch = { planText: plan, codeText: code };
    if (isNew) patch.revealedEarly = revealedEarly;
    await updateProblem(problem.id, patch);
    setSubmitting(false);
    setStep('note');
  }

  async function handleSaveNote(e) {
    e.preventDefault();
    await updateProblem(problem.id, { recognitionNote: note });
    if (isNew && !hintRevealed) {
      // Solved cold, inside the timer, with zero hint reveals — unambiguous.
      await reviewProblem(problem.id, 'green');
      onComplete();
      return;
    }
    setStep('rating');
  }

  async function handleRate(status) {
    if (rating) return;
    setRating(true);
    await reviewProblem(problem.id, status);
    onComplete();
  }

  if (step === 'rating') {
    return (
      <div className="recall-card">
        <div className="recall-card-body">
          <h2 className="recall-title">{problem.title}</h2>
          <p className="hint-text">How did it go?</p>
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
    );
  }

  if (step === 'note') {
    return (
      <form onSubmit={handleSaveNote} className="redq-practice-card">
        <h2 className="recall-title">{problem.title}</h2>
        <label>
          I should recognize this needs ___ because ___
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="I should recognize this needs a sliding window because the array is contiguous..."
          />
        </label>
        <div className="modal-actions">
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="redq-practice-card">
      <div className="redq-practice-header">
        <h2 className="recall-title">
          {problem.url ? (
            <a href={problem.url} target="_blank" rel="noreferrer">
              {problem.title}
            </a>
          ) : (
            problem.title
          )}
        </h2>
        <div className="pattern-chips">
          {problem.patterns.length === 0 && <span className="tag-chip-sm tag-chip-empty">No pattern tagged</span>}
          {problem.patterns.map((tag) => (
            <Link key={tag} to={`/templates/${encodeURIComponent(tag)}`} className="tag-chip-sm tag-chip-link">
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {isNew && !hintRevealed && (
        <div className="struggle-timer-row">
          <div className="struggle-timer">{formatMMSS(secondsLeft)}</div>
          <button type="button" className="btn-secondary" disabled={secondsLeft > 0} onClick={handleReveal}>
            Reveal hint
          </button>
          <button type="button" className="btn-link" onClick={handleEndEarly}>
            I'm stuck, end early
          </button>
        </div>
      )}

      {hintRevealed && (
        <label>
          {isNew ? 'Hint / approach notes' : 'Approach notes'}
          <textarea
            rows={4}
            value={hintNotes}
            onChange={(e) => setHintNotes(e.target.value)}
            placeholder="Paste your notes, a link, or jot the approach here..."
          />
        </label>
      )}

      <form onSubmit={handleSubmitWork} className="redq-form">
        <label>
          Plan (pseudocode)
          <textarea
            autoFocus
            rows={6}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Sketch the approach before writing code..."
          />
        </label>
        <label>
          Code
          <textarea
            rows={10}
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your solution..."
            spellCheck={false}
          />
        </label>
        <div className="modal-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
