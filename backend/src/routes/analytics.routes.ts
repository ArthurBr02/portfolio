import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { auth } from '../middleware/auth';
import { trackController, analyticsController } from '../controllers/analytics.controller';

const router = Router();

const trackLimiter = rateLimit({
  windowMs: 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/track', trackLimiter, trackController);
router.get('/admin/analytics', auth, analyticsController);

export default router;
