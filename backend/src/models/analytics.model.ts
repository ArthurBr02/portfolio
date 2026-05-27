import { db } from '../config/database';

export function trackPageView(path: string, userAgent: string, ipHash: string): void {
  db.prepare('INSERT INTO page_views (path, user_agent, ip_hash) VALUES (?, ?, ?)').run(path, userAgent, ipHash);
}

export function getAnalytics(days: number): { date: string; count: number }[] {
  return db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM page_views
    WHERE created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(days) as { date: string; count: number }[];
}

export function getAnalyticsSummary() {
  const totalViews = (db.prepare('SELECT COUNT(*) as count FROM page_views').get() as { count: number }).count;
  return { totalViews };
}
