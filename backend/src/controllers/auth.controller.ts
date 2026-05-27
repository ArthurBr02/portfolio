import { Request, Response } from 'express';
import { login, changePassword } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export function loginController(req: Request, res: Response) {
  const { username, password } = req.body;
  const token = login(username, password);
  if (!token) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.json({ token });
}

export function changePasswordController(req: AuthRequest, res: Response) {
  const { current_password, new_password } = req.body;
  const ok = changePassword(req.userId!, current_password, new_password);
  if (!ok) {
    res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    return;
  }
  res.json({ success: true });
}
