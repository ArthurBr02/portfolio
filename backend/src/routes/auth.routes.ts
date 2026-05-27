import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { loginController, changePasswordController } from '../controllers/auth.controller';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8),
});

router.post('/auth/login', validate(loginSchema), loginController);
router.put('/auth/admin/password', auth, validate(changePasswordSchema), changePasswordController);

export default router;
