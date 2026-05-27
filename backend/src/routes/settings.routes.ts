import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getSettingsController, updateSettingsController } from '../controllers/settings.controller';

const router = Router();

router.get('/settings', getSettingsController);
router.put('/admin/settings', auth, updateSettingsController);

export default router;
