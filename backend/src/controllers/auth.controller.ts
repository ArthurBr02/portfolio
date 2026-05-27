import { Request, Response } from 'express';
import { login } from '../services/auth.service';

export function loginController(req: Request, res: Response) {
  const { username, password } = req.body;
  const token = login(username, password);
  if (!token) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.json({ token });
}
