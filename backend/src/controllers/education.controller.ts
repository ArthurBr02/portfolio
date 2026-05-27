import { Request, Response } from 'express';
import { getAllEducation, createEducation, updateEducation, deleteEducation } from '../models/education.model';

export function listEducation(req: Request, res: Response) {
  res.json(getAllEducation());
}

export function createEducationController(req: Request, res: Response) {
  const id = createEducation(req.body);
  res.status(201).json({ id });
}

export function updateEducationController(req: Request, res: Response) {
  updateEducation(Number(req.params.id), req.body);
  res.json({ success: true });
}

export function deleteEducationController(req: Request, res: Response) {
  deleteEducation(Number(req.params.id));
  res.json({ success: true });
}
