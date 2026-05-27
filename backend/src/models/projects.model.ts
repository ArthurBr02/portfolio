import { db } from '../config/database';

export interface Project {
  id: number;
  title_fr: string | null;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  short_description_fr: string | null;
  short_description_en: string | null;
  image_url: string | null;
  demo_url: string | null;
  repo_url: string | null;
  technologies: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  sort_order: number;
}

export function getAllProjects(): Project[] {
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all() as Project[];
  const images = db.prepare('SELECT * FROM project_images ORDER BY sort_order ASC').all() as ProjectImage[];
  return projects.map(p => ({
    ...p,
    images: images.filter(i => i.project_id === p.id),
  }));
}

export function getProjectById(id: number): Project | undefined {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
  if (!project) return undefined;
  project.images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC').all(id) as ProjectImage[];
  return project;
}

export function createProject(data: Omit<Project, 'id' | 'created_at' | 'images'>): number {
  const result = db.prepare(`
    INSERT INTO projects (title_fr, title_en, description_fr, description_en,
      short_description_fr, short_description_en, image_url, demo_url, repo_url,
      technologies, category, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.title_fr, data.title_en, data.description_fr, data.description_en,
    data.short_description_fr, data.short_description_en, data.image_url,
    data.demo_url, data.repo_url, data.technologies, data.category, data.sort_order ?? 0
  );
  return result.lastInsertRowid as number;
}

export function updateProject(id: number, data: Partial<Omit<Project, 'id' | 'created_at' | 'images'>>): void {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE projects SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
}

export function deleteProject(id: number): void {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

export function addProjectImage(projectId: number, imageUrl: string, sortOrder = 0): number {
  const result = db.prepare(
    'INSERT INTO project_images (project_id, image_url, sort_order) VALUES (?, ?, ?)'
  ).run(projectId, imageUrl, sortOrder);
  return result.lastInsertRowid as number;
}

export function deleteProjectImage(imageId: number): void {
  db.prepare('DELETE FROM project_images WHERE id = ?').run(imageId);
}
