import { getCollection, saveCollection } from '../localStorageClient';
import { todayISO } from '../scheduling';

const KEY = 'dsa_tracker_time_budget';

function emptyState() {
  return { date: todayISO(), hours: null };
}

function load() {
  const stored = getCollection(KEY, emptyState);
  if (stored.date !== todayISO()) {
    const fresh = emptyState();
    saveCollection(KEY, fresh);
    return fresh;
  }
  return stored;
}

export async function getTodayHours() {
  return load().hours;
}

export async function setTodayHours(hours) {
  const state = { date: todayISO(), hours };
  saveCollection(KEY, state);
  return state;
}
