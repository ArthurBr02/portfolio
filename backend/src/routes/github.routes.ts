import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { importFromGithubController } from '../controllers/github.controller';

const router = Router();

const importSchema = z.object({
  url: z.string().url().includes('github.com'),
});

router.post('/admin/github/import', auth, validate(importSchema), importFromGithubController);

export default router;
