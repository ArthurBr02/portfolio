import { Request, Response } from 'express';
import path from 'path';

export function uploadController(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
}
