import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables
config();

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;