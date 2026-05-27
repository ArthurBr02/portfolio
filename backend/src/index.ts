import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import './config/database';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import projectsRoutes from './routes/projects.routes';
import experiencesRoutes from './routes/experiences.routes';
import educationRoutes from './routes/education.routes';
import skillsRoutes from './routes/skills.routes';
import translationsRoutes from './routes/translations.routes';
import settingsRoutes from './routes/settings.routes';
import messagesRoutes from './routes/messages.routes';
import analyticsRoutes from './routes/analytics.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', messagesRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', uploadRoutes);

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(Number(env.PORT), () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});
