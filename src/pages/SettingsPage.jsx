import { useState } from 'react';
import { downloadBackup, importAllData } from '../data/backup';
import SetupPage from './SetupPage';

export default function SettingsPage() {
  const [rerunning, setRerunning] = useState(false);
  const [importError, setImportError] = useState('');

  if (rerunning) {
    return <SetupPage mode="rerun" onComplete={() => setRerunning(false)} onCancel={() => setRerunning(false)} />;
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportError('');
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const ok = window.confirm(
        `This replaces your current problems, patterns, templates, mock sessions, and settings with the contents of "${file.name}". This cannot be undone. Continue?`
      );
      if (!ok) return;
      importAllData(backup);
      window.location.reload();
    } catch (err) {
      setImportError(err.message || 'Could not read that file.');
    }
  }

  return (
    <div className="page settings-page">
      <h1>Settings</h1>

      <section className="dash-section">
        <h2>NeetCode 150 setup</h2>
        <p className="hint-text">
          Re-run the setup screen to fix your solved/unsolved checkboxes. Status and next-review-date get
          recalculated from your new selections; recognition notes, saved plans/code, and pattern templates are
          left untouched.
        </p>
        <button className="btn-secondary" onClick={() => setRerunning(true)}>
          Re-run setup
        </button>
      </section>

      <section className="dash-section">
        <h2>Backup</h2>
        <p className="hint-text">
          Everything lives only in this browser's local storage — clearing site data or switching browsers loses
          it. Export a backup periodically, especially before clearing browser data.
        </p>
        <div className="settings-backup-actions">
          <button className="btn-secondary" onClick={downloadBackup}>
            Export all data
          </button>
          <label className="btn-secondary settings-import-label">
            Import backup
            <input type="file" accept="application/json" onChange={handleImportFile} hidden />
          </label>
        </div>
        {importError && <p className="setup-warning">{importError}</p>}
      </section>
    </div>
  );
}
