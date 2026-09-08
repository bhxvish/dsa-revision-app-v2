// Splits `hours` of available time across the three daily buckets, proportional
// to the configured percentages (normalized so they needn't sum to exactly 100).
export function computeSplit(hours, timeSplit) {
  const totalMinutes = Math.max(0, hours) * 60;
  const totalPct = timeSplit.newProblems + timeSplit.redQueue + timeSplit.dueReviews;
  const norm = (pct) => (totalPct > 0 ? pct / totalPct : 0);
  return {
    newProblems: Math.round(totalMinutes * norm(timeSplit.newProblems)),
    redQueue: Math.round(totalMinutes * norm(timeSplit.redQueue)),
    dueReviews: Math.round(totalMinutes * norm(timeSplit.dueReviews)),
  };
}

export function formatMinutes(mins) {
  if (mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
