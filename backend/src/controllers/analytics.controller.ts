import { Request, Response } from 'express';
import crypto from 'crypto';
import { trackPageView, getAnalytics, getAnalyticsSummary } from '../models/analytics.model';
import { getAllMessages } from '../models/messages.model';
import { getAllProjects } from '../models/projects.model';
import { getAllExperiences } from '../models/experiences.model';
import { getAllSettings } from '../models/settings.model';

export function trackController(req: Request, res: Response) {
  const { path, user_agent } = req.body;
  const ip = req.ip ?? '';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
  trackPageView(path ?? '/', user_agent ?? '', ipHash);
  res.status(204).end();
}

export function analyticsController(req: Request, res: Response) {
  const days = Number(req.query.days) || 7;
  const views = getAnalytics(days);
  const summary = getAnalyticsSummary();
  const messages = getAllMessages();
  const projects = getAllProjects();
  const experiences = getAllExperiences();
  const settings = getAllSettings();
  const activeSections = Object.entries(settings).filter(
    ([k, v]) => k.startsWith('section_') && v === 'true'
  ).length;
  const unreadMessages = messages.filter(m => m.is_read === 0);

  res.json({
    views,
    totalViews: summary.totalViews,
    projectCount: projects.length,
    experienceCount: experiences.length,
    unreadMessageCount: unreadMessages.length,
    activeSections,
    recentMessages: messages.slice(0, 3),
  });
}
