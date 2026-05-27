import { z } from 'zod';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  ADMIN_USERNAME: z.string().min(1, 'ADMIN_USERNAME is required'),
  ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required'),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  OPENROUTER_API_KEY: z.string().default(''),
  AI_MODEL: z.string().default('mistralai/mistral-small-3.1-24b-instruct:free'),
  DB_PATH: z.string().default(''),
  UPLOADS_DIR: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
