import { db } from '../config/database';

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export function updateSettings(patch: Record<string, string>): void {
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const update = db.transaction((patch: Record<string, string>) => {
    for (const [key, value] of Object.entries(patch)) {
      upsert.run(key, value);
    }
  });
  update(patch);
}
