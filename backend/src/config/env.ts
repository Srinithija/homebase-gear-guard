import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  CORS_ORIGIN: z.string().default('*'), // Allow all origins in production if not specified
});

// Parse environment variables with better error handling
let env;
try {
  env = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '3001',
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  });
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };