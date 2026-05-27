import { Router } from 'express';
import { auth } from '../middleware/auth';
import { listSkills, createSkillController, updateSkillController, deleteSkillController } from '../controllers/skills.controller';

const router = Router();

router.get('/', listSkills);
router.post('/admin/skills', auth, createSkillController);
router.put('/admin/skills/:id', auth, updateSkillController);
router.delete('/admin/skills/:id', auth, deleteSkillController);

export default router;
