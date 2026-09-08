export function getPatternsInUse(problems) {
  const set = new Set();
  problems.forEach((p) => p.patterns.forEach((tag) => set.add(tag)));
  return [...set].sort((a, b) => a.localeCompare(b));
}
