import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listUe, createUeController, updateUeController, deleteUeController } from '../controllers/educationUe.controller';

const router = Router();

const ueSchema = z.object({
  semester: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  sort_order: z.number().int().optional(),
});

router.get('/admin/education/:educationId/ue', auth, listUe);
router.post('/admin/education/:educationId/ue', auth, validate(ueSchema), createUeController);
router.put('/admin/education-ue/:id', auth, validate(ueSchema.partial()), updateUeController);
router.delete('/admin/education-ue/:id', auth, deleteUeController);

export default router;
