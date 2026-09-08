import { toLocalISODate } from './scheduling';

// Pure, on-the-fly analytics over Problem + MockSession data — nothing stored.

// Combines two signals per pattern, weighted equally:
//  - mock pass rate (solved / attempted, across all logged mock sessions)
//  - review accuracy (green / reviewed, from the Problem's current status —
//    the best available proxy for "quick recall accuracy" since status is a
//    single current value, not a full history of past ratings)
// Returns patterns with at least one signal, sorted weakest (lowest score) first.
export function computePatternScores(problems, mockSessions) {
  const stats = {};

  function ensure(pattern) {
    if (!stats[pattern]) {
      stats[pattern] = { mockSolved: 0, mockTotal: 0, statusGreen: 0, statusTotal: 0 };
    }
    return stats[pattern];
  }

  mockSessions.forEach((session) => {
    session.problems.forEach((entry) => {
      if (!entry.pattern) return;
      const s = ensure(entry.pattern);
      s.mockTotal += 1;
      if (entry.solved) s.mockSolved += 1;
    });
  });

  problems.forEach((p) => {
    if (!p.status) return;
    p.patterns.forEach((pattern) => {
      const s = ensure(pattern);
      s.statusTotal += 1;
      if (p.status === 'green') s.statusGreen += 1;
    });
  });

  return Object.entries(stats)
    .map(([pattern, s]) => {
      const mockRate = s.mockTotal > 0 ? s.mockSolved / s.mockTotal : null;
      const statusRate = s.statusTotal > 0 ? s.statusGreen / s.statusTotal : null;
      const rates = [mockRate, statusRate].filter((r) => r !== null);
      const score = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
      return {
        pattern,
        mockRate,
        mockSolved: s.mockSolved,
        mockTotal: s.mockTotal,
        statusRate,
        statusGreen: s.statusGreen,
        statusTotal: s.statusTotal,
        score,
      };
    })
    .filter((s) => s.score !== null)
    .sort((a, b) => a.score - b.score);
}

// Lower rank = weaker = should sort first. Patterns absent from rankedScores
// (no data yet) rank last (Infinity), same as a problem with no patterns.
export function getWeaknessRank(rankedScores, patterns) {
  if (!patterns || patterns.length === 0) return Infinity;
  const ranks = patterns
    .map((p) => rankedScores.findIndex((r) => r.pattern === p))
    .filter((i) => i !== -1);
  return ranks.length > 0 ? Math.min(...ranks) : Infinity;
}

function getWeekStartISO(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toLocalISODate(d);
}

// pattern x week pass-rate table, rows ordered by patternOrder (weakest first).
export function computeWeeklyTrend(mockSessions, patternOrder = []) {
  const cellMap = {};
  const weekSet = new Set();

  mockSessions.forEach((session) => {
    const week = getWeekStartISO(session.date);
    weekSet.add(week);
    session.problems.forEach((entry) => {
      if (!entry.pattern) return;
      const key = `${entry.pattern}|${week}`;
      if (!cellMap[key]) cellMap[key] = { solved: 0, total: 0 };
      cellMap[key].total += 1;
      if (entry.solved) cellMap[key].solved += 1;
    });
  });

  const weeks = [...weekSet].sort();
  const allPatterns =
    patternOrder.length > 0
      ? patternOrder
      : [...new Set(mockSessions.flatMap((s) => s.problems.map((p) => p.pattern).filter(Boolean)))];

  const rows = allPatterns
    .filter((pattern) => weeks.some((w) => cellMap[`${pattern}|${w}`]))
    .map((pattern) => ({
      pattern,
      cells: weeks.map((w) => cellMap[`${pattern}|${w}`] || null),
    }));

  return { weeks, rows };
}
