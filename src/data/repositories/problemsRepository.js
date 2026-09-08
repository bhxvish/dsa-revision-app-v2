import { getCollection, saveCollection } from '../localStorageClient';
import { computeNextReviewDate, getDueProblems, todayISO } from '../scheduling';

const KEY = 'dsa_tracker_problems';

function loadAll() {
  return getCollection(KEY, () => []);
}

function persist(items) {
  saveCollection(KEY, items);
}

function makeProblem(input) {
  const status = input.status || null;
  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    url: input.url?.trim() || '',
    neetcodeCategory: input.neetcodeCategory?.trim() || '',
    patterns: input.patterns || [],
    status,
    lastReviewed: null,
    nextReviewDate: computeNextReviewDate(status),
    recognitionNote: input.recognitionNote || '',
    planText: input.planText || '',
    codeText: input.codeText || '',
    timesReviewed: 0,
    createdAt: new Date().toISOString(),
    // Optional, only present when relevant — see scheduling.isDue.
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.needsTriage === false ? { needsTriage: false } : {}),
  };
}

export async function listProblems() {
  return loadAll();
}

export async function getProblem(id) {
  return loadAll().find((p) => p.id === id) || null;
}

export async function listDueProblems() {
  return getDueProblems(loadAll());
}

export async function createProblem(input) {
  const items = loadAll();
  const problem = makeProblem(input);
  items.push(problem);
  persist(items);
  return problem;
}

// entries: [{ title, url }] — used by bulk triage. Status/patterns are left
// unset so these immediately show up in the due queue for tagging + rating.
export async function createProblemsBulk(entries) {
  const items = loadAll();
  const created = entries.map((entry) => makeProblem({ title: entry.title, url: entry.url }));
  items.push(...created);
  persist(items);
  return created;
}

// entries: [{ title, url, category, pattern, order, checked }] — from the
// NeetCode 150 setup screen, first run or re-run. Existing problems are
// matched by title and only have status/nextReviewDate/needsTriage touched
// (plus `order` backfilled if it was missing, so the list-order sort works
// uniformly); everything else (recognition notes, plans, code, pattern
// edits) is left exactly as it was. New titles are created fresh with the
// seed's metadata.
export async function applySeedSelections(entries) {
  const items = loadAll();
  const byTitle = new Map(items.map((p) => [p.title.toLowerCase(), p]));

  entries.forEach((entry) => {
    const key = entry.title.toLowerCase();
    const existing = byTitle.get(key);
    if (existing) {
      existing.status = null;
      existing.nextReviewDate = null;
      if (existing.order === undefined) {
        existing.order = entry.order;
      }
      if (entry.checked) {
        delete existing.needsTriage;
      } else {
        existing.needsTriage = false;
      }
    } else {
      const created = makeProblem({
        title: entry.title,
        url: entry.url,
        neetcodeCategory: entry.category,
        patterns: entry.pattern ? [entry.pattern] : [],
        order: entry.order,
        needsTriage: entry.checked ? undefined : false,
      });
      items.push(created);
      byTitle.set(key, created);
    }
  });

  persist(items);
  return items;
}

export async function updateProblem(id, patch) {
  const items = loadAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Problem ${id} not found`);
  const next = { ...items[idx], ...patch };
  if ('status' in patch && !('nextReviewDate' in patch)) {
    next.nextReviewDate = computeNextReviewDate(patch.status);
  }
  items[idx] = next;
  persist(items);
  return next;
}

// Records an actual review outcome (Quick Recall Check, Practice) — unlike a
// plain edit, this bumps timesReviewed/lastReviewed alongside the status change.
export async function reviewProblem(id, status) {
  const items = loadAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Problem ${id} not found`);
  const today = todayISO();
  const updated = {
    ...items[idx],
    status,
    lastReviewed: today,
    nextReviewDate: computeNextReviewDate(status),
    timesReviewed: (items[idx].timesReviewed || 0) + 1,
  };
  items[idx] = updated;
  persist(items);
  return updated;
}

export async function deleteProblem(id) {
  persist(loadAll().filter((p) => p.id !== id));
}
