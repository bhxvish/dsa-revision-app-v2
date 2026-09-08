import { useEffect, useState } from 'react';

const SOFT_LIMIT_SECONDS = 120;

export default function ReviewTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const over = seconds >= SOFT_LIMIT_SECONDS;
  const remaining = Math.abs(SOFT_LIMIT_SECONDS - seconds);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className={`review-timer ${over ? 'over' : ''}`}>
      {over ? '+' : ''}
      {mm}:{ss}
    </div>
  );
}
