import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listSkills, createSkillController, updateSkillController, deleteSkillController } from '../controllers/skills.controller';

const router = Router();

const skillSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional().nullable(),
  category_fr: z.string().min(1),
  category_en: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  sort_order: z.number().int().optional(),
});

router.get('/skills', listSkills);
router.post('/admin/skills', auth, validate(skillSchema), createSkillController);
router.put('/admin/skills/:id', auth, validate(skillSchema.partial()), updateSkillController);
router.delete('/admin/skills/:id', auth, deleteSkillController);

export default router;
