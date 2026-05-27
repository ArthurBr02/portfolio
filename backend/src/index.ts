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
import educationUeRoutes from './routes/educationUe.routes';
import skillsRoutes from './routes/skills.routes';
import translationsRoutes from './routes/translations.routes';
import settingsRoutes from './routes/settings.routes';
import messagesRoutes from './routes/messages.routes';
import analyticsRoutes from './routes/analytics.routes';
import uploadRoutes from './routes/upload.routes';
import githubRoutes from './routes/github.routes';
import searchRoutes from './routes/search.routes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', projectsRoutes);
app.use('/api', experiencesRoutes);
app.use('/api', educationRoutes);
app.use('/api', educationUeRoutes);
app.use('/api', skillsRoutes);
app.use('/api', translationsRoutes);
app.use('/api', settingsRoutes);
app.use('/api', messagesRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', uploadRoutes);
app.use('/api', githubRoutes);
app.use('/api', searchRoutes);

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
