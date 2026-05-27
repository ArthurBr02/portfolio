import { Request, Response } from 'express';
import { getAllSkills, createSkill, updateSkill, deleteSkill } from '../models/skills.model';

export function listSkills(req: Request, res: Response) {
  res.json(getAllSkills());
}

export function createSkillController(req: Request, res: Response) {
  const id = createSkill(req.body);
  res.status(201).json({ id });
}

export function updateSkillController(req: Request, res: Response) {
  updateSkill(Number(req.params.id), req.body);
  res.json({ success: true });
}

export function deleteSkillController(req: Request, res: Response) {
  deleteSkill(Number(req.params.id));
  res.json({ success: true });
}
