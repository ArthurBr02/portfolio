import { db } from '../config/database';

export interface Experience {
  id: number;
  company: string | null;
  role_fr: string | null;
  role_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  start_date: string | null;
  end_date: string | null;
  current: number;
  sort_order: number;
}

export function getAllExperiences(): Experience[] {
  return db.prepare('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC').all() as Experience[];
}

export function createExperience(data: Omit<Experience, 'id'>): number {
  const result = db.prepare(`
    INSERT INTO experiences (company, role_fr, role_en, description_fr, description_en,
      start_date, end_date, current, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.company, data.role_fr, data.role_en, data.description_fr, data.description_en,
    data.start_date, data.end_date, data.current ?? 0, data.sort_order ?? 0
  );
  return result.lastInsertRowid as number;
}

export function updateExperience(id: number, data: Partial<Omit<Experience, 'id'>>): void {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE experiences SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
}

export function deleteExperience(id: number): void {
  db.prepare('DELETE FROM experiences WHERE id = ?').run(id);
}
