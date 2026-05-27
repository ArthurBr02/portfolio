import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getProfileController, updateProfileController } from '../controllers/profile.controller';

const router = Router();

router.get('/profile', getProfileController);
router.put('/admin/profile', auth, updateProfileController);

export default router;
