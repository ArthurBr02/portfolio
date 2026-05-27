import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getTranslations, updateTranslations } from '../controllers/translations.controller';

const router = Router();

router.get('/translations/:lang', getTranslations);
router.put('/admin/translations', auth, updateTranslations);

export default router;
