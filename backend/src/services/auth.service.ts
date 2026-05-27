import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername, findUserById, updatePasswordHash } from '../models/auth.model';
import { env } from '../config/env';

export function login(username: string, password: string): string | null {
  const user = findUserByUsername(username);
  if (!user) return null;
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return null;
  return jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function changePassword(userId: number, currentPassword: string, newPassword: string): boolean {
  const user = findUserById(userId);
  if (!user) return false;
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) return false;
  const newHash = bcrypt.hashSync(newPassword, 10);
  updatePasswordHash(userId, newHash);
  return true;
}
