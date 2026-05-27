import { db } from '../config/database';

export interface Message {
  id: number;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  is_read: number;
  created_at: string;
}

export function getAllMessages(): Message[] {
  return db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all() as Message[];
}

export function createMessage(data: Omit<Message, 'id' | 'is_read' | 'created_at'>): number {
  const result = db.prepare(
    'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
  ).run(data.name, data.email, data.subject, data.message);
  return result.lastInsertRowid as number;
}

export function markMessageRead(id: number): void {
  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(id);
}

export function deleteMessage(id: number): void {
  db.prepare('DELETE FROM messages WHERE id = ?').run(id);
}

export function getUnreadCount(): number {
  const result = db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get() as { count: number };
  return result.count;
}
