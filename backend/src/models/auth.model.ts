import { db } from '../config/database';

export interface User {
  id: number;
  username: string;
  password_hash: string;
}

export function findUserByUsername(username: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function updatePasswordHash(id: number, hash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
}
