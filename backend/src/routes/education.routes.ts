import { Router } from 'express';
import { auth } from '../middleware/auth';
import { listEducation, createEducationController, updateEducationController, deleteEducationController } from '../controllers/education.controller';

const router = Router();

router.get('/', listEducation);
router.post('/admin/education', auth, createEducationController);
router.put('/admin/education/:id', auth, updateEducationController);
router.delete('/admin/education/:id', auth, deleteEducationController);

export default router;
