// Thin persistence layer. Every repository goes through here so storage
// can later be swapped for a real backend without touching call sites.

function readRaw(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRaw(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCollection(key, seedFn) {
  const existing = readRaw(key);
  if (existing) return existing;
  const seeded = seedFn ? seedFn() : [];
  writeRaw(key, seeded);
  return seeded;
}

export function saveCollection(key, items) {
  writeRaw(key, items);
}
