import { Request, Response } from 'express';
import { getAllUeByEducation, createUe, updateUe, deleteUe } from '../models/educationUe.model';

export function listUe(req: Request, res: Response) {
  res.json(getAllUeByEducation(Number(req.params.educationId)));
}

export function createUeController(req: Request, res: Response) {
  const id = createUe({ ...req.body, education_id: Number(req.params.educationId) });
  res.status(201).json({ id });
}

export function updateUeController(req: Request, res: Response) {
  updateUe(Number(req.params.id), req.body);
  res.json({ success: true });
}

export function deleteUeController(req: Request, res: Response) {
  deleteUe(Number(req.params.id));
  res.json({ success: true });
}
