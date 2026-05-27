import { Request, Response } from 'express';
import { getAllSettings, updateSettings } from '../models/settings.model';

export function getSettingsController(req: Request, res: Response) {
  res.json(getAllSettings());
}

export function updateSettingsController(req: Request, res: Response) {
  updateSettings(req.body);
  res.json({ success: true });
}
