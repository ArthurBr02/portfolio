import { db } from '../config/database';

export interface User {
  id: number;
  username: string;
  password_hash: string;
}

export function findUserByUsername(username: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
}
