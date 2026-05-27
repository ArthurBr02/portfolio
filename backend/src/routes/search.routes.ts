import { Router } from 'express';
import { auth } from '../middleware/auth';
import { db } from '../config/database';

const router = Router();

router.get('/admin/search', auth, (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) { res.json({}); return; }

  const like = `%${q}%`;

  const projects = db.prepare(`
    SELECT id, title_fr AS label, category AS sub FROM projects
    WHERE title_fr LIKE ? OR title_en LIKE ? OR description_fr LIKE ?
    LIMIT 5
  `).all(like, like, like) as { id: number; label: string; sub: string }[];

  const experiences = db.prepare(`
    SELECT id, role_fr AS label, company AS sub FROM experiences
    WHERE role_fr LIKE ? OR role_en LIKE ? OR company LIKE ?
    LIMIT 5
  `).all(like, like, like) as { id: number; label: string; sub: string }[];

  const education = db.prepare(`
    SELECT id, degree_fr AS label, school AS sub FROM education
    WHERE degree_fr LIKE ? OR degree_en LIKE ? OR school LIKE ?
    LIMIT 5
  `).all(like, like, like) as { id: number; label: string; sub: string }[];

  const skills = db.prepare(`
    SELECT id, name AS label, category AS sub FROM skills
    WHERE name LIKE ? OR category LIKE ?
    LIMIT 5
  `).all(like, like) as { id: number; label: string; sub: string }[];

  const messages = db.prepare(`
    SELECT id, sender_name AS label, sender_email AS sub FROM messages
    WHERE sender_name LIKE ? OR sender_email LIKE ? OR content LIKE ?
    LIMIT 5
  `).all(like, like, like) as { id: number; label: string; sub: string }[];

  res.json({ projects, experiences, education, skills, messages });
});

export default router;
