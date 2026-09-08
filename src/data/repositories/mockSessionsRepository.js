import { getCollection, saveCollection } from '../localStorageClient';

const KEY = 'dsa_tracker_mock_sessions';

function loadAll() {
  return getCollection(KEY, () => []);
}

function persist(items) {
  saveCollection(KEY, items);
}

export async function listMockSessions() {
  return loadAll();
}

// input.problems: [{ problemId, title, pattern, solved, notes }]
export async function createMockSession(input) {
  const items = loadAll();
  const session = {
    id: crypto.randomUUID(),
    date: input.date,
    durationMinutes: input.durationMinutes,
    problems: input.problems,
    createdAt: new Date().toISOString(),
  };
  items.push(session);
  persist(items);
  return session;
}
