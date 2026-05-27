import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  listProjects, getProject, createProjectController, updateProjectController,
  deleteProjectController, addImageController, deleteImageController,
} from '../controllers/projects.controller';

const router = Router();

router.get('/projects', listProjects);
router.get('/projects/:id', getProject);
router.post('/admin/projects', auth, createProjectController);
router.put('/admin/projects/:id', auth, updateProjectController);
router.delete('/admin/projects/:id', auth, deleteProjectController);
router.post('/admin/projects/:id/images', auth, addImageController);
router.delete('/admin/projects/:id/images/:imageId', auth, deleteImageController);

export default router;
