import { Request, Response } from 'express';
import { getProfile, upsertProfile } from '../models/profile.model';

export function getProfileController(req: Request, res: Response) {
  const profile = getProfile();
  res.json(profile ?? {});
}

export function updateProfileController(req: Request, res: Response) {
  upsertProfile(req.body);
  res.json({ success: true });
}
