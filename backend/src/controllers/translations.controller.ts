import { Request, Response } from 'express';
import { getTranslationsByLang, upsertTranslations } from '../models/translations.model';

export function getTranslations(req: Request, res: Response) {
  res.json(getTranslationsByLang(req.params.lang));
}

export function updateTranslations(req: Request, res: Response) {
  const { lang, entries } = req.body;
  upsertTranslations(lang, entries);
  res.json({ success: true });
}
