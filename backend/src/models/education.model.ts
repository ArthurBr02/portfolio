import { db } from '../config/database';

export interface Education {
  id: number;
  school: string | null;
  degree_fr: string | null;
  degree_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
}

export function getAllEducation(): Education[] {
  return db.prepare('SELECT * FROM education ORDER BY sort_order ASC, start_date DESC').all() as Education[];
}

export function createEducation(data: Omit<Education, 'id'>): number {
  const result = db.prepare(`
    INSERT INTO education (school, degree_fr, degree_en, description_fr, description_en,
      start_date, end_date, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.school, data.degree_fr, data.degree_en, data.description_fr, data.description_en,
    data.start_date, data.end_date, data.sort_order ?? 0
  );
  return result.lastInsertRowid as number;
}

export function updateEducation(id: number, data: Partial<Omit<Education, 'id'>>): void {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE education SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
}

export function deleteEducation(id: number): void {
  db.prepare('DELETE FROM education WHERE id = ?').run(id);
}
