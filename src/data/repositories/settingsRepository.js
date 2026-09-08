import { getCollection, saveCollection } from '../localStorageClient';

const KEY = 'dsa_tracker_settings';

const DEFAULTS = {
  redsPerDay: 3,
  struggleTimerMinutes: 25,
  timeSplit: { newProblems: 60, redQueue: 25, dueReviews: 15 },
};

function load() {
  return getCollection(KEY, () => ({ ...DEFAULTS }));
}

export async function getSettings() {
  return { ...DEFAULTS, ...load() };
}

export async function updateSettings(patch) {
  const next = { ...load(), ...patch };
  saveCollection(KEY, next);
  return next;
}
