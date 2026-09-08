import { getCollection, saveCollection } from '../localStorageClient';
import { todayISO } from '../scheduling';

const KEY = 'dsa_tracker_pattern_templates';

function loadAll() {
  return getCollection(KEY, () => []);
}

export async function listTemplates() {
  return loadAll();
}

export async function getTemplate(pattern) {
  return loadAll().find((t) => t.pattern === pattern) || null;
}

export async function upsertTemplate(pattern, content) {
  const items = loadAll();
  const idx = items.findIndex((t) => t.pattern === pattern);
  const entry = { pattern, content, lastUpdated: todayISO() };
  if (idx === -1) {
    items.push(entry);
  } else {
    items[idx] = entry;
  }
  saveCollection(KEY, items);
  return entry;
}
