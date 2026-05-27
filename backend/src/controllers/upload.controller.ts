import { Request, Response } from 'express';

export function uploadController(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const url = `/api/media/${req.file.filename}`;
  res.json({ url });
}
