import { db } from '../config/database';

export interface EducationUe {
  id: number;
  education_id: number;
  semester: string | null;
  code: string | null;
  name: string;
  description: string | null;
  sort_order: number;
}

export function getAllUeByEducation(educationId: number): EducationUe[] {
  return db.prepare('SELECT * FROM education_ue WHERE education_id = ? ORDER BY sort_order ASC, semester ASC').all(educationId) as EducationUe[];
}

export function createUe(data: Omit<EducationUe, 'id'>): number {
  const result = db.prepare(`
    INSERT INTO education_ue (education_id, semester, code, name, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(data.education_id, data.semester, data.code, data.name, data.description ?? null, data.sort_order ?? 0);
  return result.lastInsertRowid as number;
}

export function updateUe(id: number, data: Partial<Omit<EducationUe, 'id'>>): void {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE education_ue SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
}

export function deleteUe(id: number): void {
  db.prepare('DELETE FROM education_ue WHERE id = ?').run(id);
}
