const REVIEW_INTERVAL_DAYS = { red: 1, yellow: 2, green: 14 };

// Local calendar date as YYYY-MM-DD. Deliberately not toISOString(), which
// converts to UTC and can land on the wrong calendar day in timezones ahead
// of UTC (e.g. a local midnight becomes "yesterday" in UTC).
export function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO() {
  return toLocalISODate(new Date());
}

export function computeNextReviewDate(status, fromDate = new Date()) {
  const days = REVIEW_INTERVAL_DAYS[status];
  if (!days) return null;
  const next = new Date(fromDate);
  next.setDate(next.getDate() + days);
  return toLocalISODate(next);
}

export function isDue(problem, today = todayISO()) {
  return !problem.nextReviewDate || problem.nextReviewDate <= today;
}

// Unset-status problems (never reviewed) sort first, then red, yellow, green.
// Within a bucket, oldest nextReviewDate first (null sorts first via '' < any date string).
const STATUS_BUCKET = { red: 1, yellow: 2, green: 3 };

export function getDueProblems(problems, today = todayISO()) {
  return problems
    .filter((p) => isDue(p, today))
    .sort((a, b) => {
      const bucketA = STATUS_BUCKET[a.status] ?? 0;
      const bucketB = STATUS_BUCKET[b.status] ?? 0;
      if (bucketA !== bucketB) return bucketA - bucketB;
      return (a.nextReviewDate || '').localeCompare(b.nextReviewDate || '');
    });
}

// Every red problem, most overdue (oldest nextReviewDate) first.
export function getRedBacklog(problems) {
  return problems
    .filter((p) => p.status === 'red')
    .sort((a, b) => (a.nextReviewDate || '').localeCompare(b.nextReviewDate || ''));
}
