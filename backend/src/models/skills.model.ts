import { db } from '../config/database';

export interface Skill {
  id: number;
  name: string | null;
  icon: string | null;
  category_fr: string | null;
  category_en: string | null;
  level: 1 | 2 | 3;
  sort_order: number;
}

export function getAllSkills(): Skill[] {
  return db.prepare('SELECT * FROM skills ORDER BY sort_order ASC, category_fr ASC').all() as Skill[];
}

export function createSkill(data: Omit<Skill, 'id'>): number {
  const result = db.prepare(`
    INSERT INTO skills (name, icon, category_fr, category_en, level, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(data.name, data.icon, data.category_fr, data.category_en, data.level ?? 1, data.sort_order ?? 0);
  return result.lastInsertRowid as number;
}

export function updateSkill(id: number, data: Partial<Omit<Skill, 'id'>>): void {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE skills SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
}

export function deleteSkill(id: number): void {
  db.prepare('DELETE FROM skills WHERE id = ?').run(id);
}
