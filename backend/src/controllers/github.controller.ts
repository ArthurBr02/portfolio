import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { importFromGithub } from '../services/github.service';

export async function importFromGithubController(req: AuthRequest, res: Response) {
  const { url } = req.body as { url: string };
  if (!url) {
    res.status(400).json({ error: 'URL manquante' });
    return;
  }
  try {
    const project = await importFromGithub(url);
    res.json(project);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ error: message });
  }
}
