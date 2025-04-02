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
export const BASE_FRONTEND_URL = process.env.BASE_FRONTEND_URL || '';
export const BASE_API_URL = process.env.BASE_API_URL || '';
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
export const SMTP_USER = process.env.SMTP_USER || '';
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || '';
export const CRYPTO_SECRET = process.env.CRYPTO_SECRET || '';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
