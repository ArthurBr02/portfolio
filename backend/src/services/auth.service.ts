import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername } from '../models/auth.model';
import { env } from '../config/env';

export function login(username: string, password: string): string | null {
  const user = findUserByUsername(username);
  if (!user) return null;
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return null;
  return jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
}
