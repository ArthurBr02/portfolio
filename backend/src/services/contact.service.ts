import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { createMessage } from '../models/messages.model';

export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  createMessage(data);

  if (!env.SMTP_HOST || !env.SMTP_USER) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.SMTP_USER,
    to: env.SMTP_USER,
    subject: `[Contact] ${data.subject}`,
    text: `De: ${data.name} <${data.email}>\n\n${data.message}`,
  });
}
