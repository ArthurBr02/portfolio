import { db } from '../config/database';

export interface Translation {
  id: number;
  lang: string;
  key: string;
  value: string;
}

export function getTranslationsByLang(lang: string): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM translations WHERE lang = ?').all(lang) as { key: string; value: string }[];
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export function upsertTranslations(lang: string, entries: Record<string, string>): void {
  const upsert = db.prepare('INSERT OR REPLACE INTO translations (lang, key, value) VALUES (?, ?, ?)');
  const upsertMany = db.transaction((entries: Record<string, string>) => {
    for (const [key, value] of Object.entries(entries)) {
      upsert.run(lang, key, value);
    }
  });
  upsertMany(entries);
}
