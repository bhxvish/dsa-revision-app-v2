import { getCollection, saveCollection } from '../localStorageClient';

const KEY = 'dsa_tracker_patterns';

const DEFAULT_PATTERNS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation',
];

function loadAll() {
  return getCollection(KEY, () => [...DEFAULT_PATTERNS]);
}

export async function listPatterns() {
  return loadAll();
}

export async function addPattern(name) {
  const items = loadAll();
  const trimmed = name.trim();
  if (!trimmed) return items;
  if (!items.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
    items.push(trimmed);
    saveCollection(KEY, items);
  }
  return items;
}

