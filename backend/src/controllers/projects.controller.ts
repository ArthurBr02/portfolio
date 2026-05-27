import { Request, Response } from 'express';
import {
  getAllProjects, getProjectById, createProject, updateProject, deleteProject,
  addProjectImage, deleteProjectImage,
} from '../models/projects.model';

export function listProjects(req: Request, res: Response) {
  res.json(getAllProjects());
}

export function getProject(req: Request, res: Response) {
  const project = getProjectById(Number(req.params.id));
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(project);
}

export function createProjectController(req: Request, res: Response) {
  const id = createProject(req.body);
  res.status(201).json({ id });
}

export function updateProjectController(req: Request, res: Response) {
  updateProject(Number(req.params.id), req.body);
  res.json({ success: true });
}

export function deleteProjectController(req: Request, res: Response) {
  deleteProject(Number(req.params.id));
  res.json({ success: true });
}

export function addImageController(req: Request, res: Response) {
  const { imageUrl, sortOrder } = req.body;
  const id = addProjectImage(Number(req.params.id), imageUrl, sortOrder);
  res.status(201).json({ id });
}

export function deleteImageController(req: Request, res: Response) {
  deleteProjectImage(Number(req.params.imageId));
  res.json({ success: true });
}
