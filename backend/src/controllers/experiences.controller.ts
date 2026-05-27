import { Request, Response } from 'express';
import { getAllExperiences, createExperience, updateExperience, deleteExperience } from '../models/experiences.model';

export function listExperiences(req: Request, res: Response) {
  res.json(getAllExperiences());
}

export function createExperienceController(req: Request, res: Response) {
  const id = createExperience(req.body);
  res.status(201).json({ id });
}

export function updateExperienceController(req: Request, res: Response) {
  updateExperience(Number(req.params.id), req.body);
  res.json({ success: true });
}

export function deleteExperienceController(req: Request, res: Response) {
  deleteExperience(Number(req.params.id));
  res.json({ success: true });
}
