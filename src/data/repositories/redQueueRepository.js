import { getCollection, saveCollection } from '../localStorageClient';
import { todayISO } from '../scheduling';

const KEY = 'dsa_tracker_red_queue_progress';

function emptyProgress() {
  return { date: todayISO(), clearedIds: [], extraAllowed: 0 };
}

function load() {
  const stored = getCollection(KEY, emptyProgress);
  if (stored.date !== todayISO()) {
    const fresh = emptyProgress();
    saveCollection(KEY, fresh);
    return fresh;
  }
  return stored;
}

export async function getRedQueueProgress() {
  return load();
}

export async function markRedCleared(problemId) {
  const progress = load();
  if (!progress.clearedIds.includes(problemId)) {
    progress.clearedIds.push(problemId);
    saveCollection(KEY, progress);
  }
  return progress;
}

export async function pullExtraRed() {
  const progress = load();
  progress.extraAllowed += 1;
  saveCollection(KEY, progress);
  return progress;
}
