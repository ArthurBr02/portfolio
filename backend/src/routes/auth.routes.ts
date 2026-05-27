import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { loginController } from '../controllers/auth.controller';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', validate(loginSchema), loginController);

export default router;
