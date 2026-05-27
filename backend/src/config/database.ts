import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { env } from './env';

const DB_PATH = env.DB_PATH || path.join(process.cwd(), 'database.sqlite');

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function runMigrations() {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, run_at TEXT DEFAULT (datetime('now')))`);
  const already = db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[];
  const ran = new Set(already.map(r => r.name));

  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (file === '002_seed.sql') continue;
    if (ran.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
  }

  runSeed();
}

function runSeed() {
  const passwordHash = bcrypt.hashSync(env.ADMIN_PASSWORD, 10);
  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)'
  );
  insertUser.run(env.ADMIN_USERNAME, passwordHash);

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  const defaults: [string, string][] = [
    ['section_hero_enabled', 'true'],
    ['section_about_enabled', 'true'],
    ['section_skills_enabled', 'true'],
    ['section_projects_enabled', 'true'],
    ['section_experience_enabled', 'true'],
    ['section_education_enabled', 'true'],
    ['section_education_ue_enabled', 'true'],
    ['section_contact_enabled', 'true'],
    ['site_title', 'Mon Portfolio'],
    ['active_theme', 'sable'],
    ['active_font', 'mono'],
    ['density', 'regular'],
    ['card_style', 'soft'],
    ['hero_style', 'split'],
    ['accent_intensity', 'warm'],
  ];
  for (const [key, value] of defaults) {
    insertSetting.run(key, value);
  }
}

runMigrations();
