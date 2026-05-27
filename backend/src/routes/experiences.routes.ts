import { Router } from 'express';
import { auth } from '../middleware/auth';
import { listExperiences, createExperienceController, updateExperienceController, deleteExperienceController } from '../controllers/experiences.controller';

const router = Router();

router.get('/experiences', listExperiences);
router.post('/admin/experiences', auth, createExperienceController);
router.put('/admin/experiences/:id', auth, updateExperienceController);
router.delete('/admin/experiences/:id', auth, deleteExperienceController);

export default router;
