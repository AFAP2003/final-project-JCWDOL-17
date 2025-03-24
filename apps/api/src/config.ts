import { config } from 'dotenv';
import { resolve } from 'path';

// List .env file. Last override first
const envs = ['.env', 'env.local'];

(function () {
  envs.forEach((envfile) =>
    config({ path: resolve(__dirname, `../${envfile}`), override: true }),
  );
})();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const FRONTEND_URL = process.env.FRONTEND_URL || '';
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
export const SMTP_USER = process.env.SMTP_USER || '';
export const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';
