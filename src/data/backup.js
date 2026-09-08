// Backs up every piece of app data that represents real prep history or
// configuration. Deliberately excludes the theme preference — pure UI chrome,
// not data worth restoring — and stored as a raw string rather than JSON.
const KEYS = [
  'dsa_tracker_problems',
  'dsa_tracker_patterns',
  'dsa_tracker_pattern_templates',
  'dsa_tracker_mock_sessions',
  'dsa_tracker_settings',
  'dsa_tracker_red_queue_progress',
  'dsa_tracker_time_budget',
];

export function exportAllData() {
  const data = {};
  KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        // skip anything unexpectedly malformed rather than fail the whole export
      }
    }
  });
  return { app: 'dsa-tracker', exportedAt: new Date().toISOString(), data };
}

export function downloadBackup() {
  const backup = exportAllData();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dsa-tracker-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importAllData(backup) {
  if (!backup || typeof backup !== 'object' || typeof backup.data !== 'object') {
    throw new Error('This file does not look like a DSA Tracker backup.');
  }
  KEYS.forEach((key) => {
    if (key in backup.data) {
      localStorage.setItem(key, JSON.stringify(backup.data[key]));
    }
  });
}
