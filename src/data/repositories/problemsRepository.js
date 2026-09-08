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
