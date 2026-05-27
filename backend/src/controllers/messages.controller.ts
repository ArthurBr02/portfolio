import { Request, Response } from 'express';
import { sendContactMessage } from '../services/contact.service';
import { getAllMessages, markMessageRead, deleteMessage } from '../models/messages.model';

export async function contactController(req: Request, res: Response) {
  try {
    await sendContactMessage(req.body);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
}

export function listMessages(req: Request, res: Response) {
  res.json(getAllMessages());
}

export function markReadController(req: Request, res: Response) {
  markMessageRead(Number(req.params.id));
  res.json({ success: true });
}

export function deleteMessageController(req: Request, res: Response) {
  deleteMessage(Number(req.params.id));
  res.json({ success: true });
}
