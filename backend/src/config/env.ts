
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .default('mongodb://127.0.0.1:27017/tracking'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must contain at least 32 characters')
    .refine(
      (value) =>
        value !== 'your_jwt_secret_change_this_in_production' &&
        value !== 'your_jwt_secret_key' &&
        value !== 'secret',
      'Replace the example JWT secret with a secure secret',
    ),

  JWT_EXPIRE: z.string().min(1).default('7d'),

  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),

  PYTHON_SERVICE_URL: z
    .string()
    .url()
    .default('http://127.0.0.1:8000'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = Object.freeze(parsedEnvironment.data);

export const isProduction = env.NODE_ENV === 'production';
