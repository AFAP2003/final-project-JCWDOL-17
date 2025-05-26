import { config } from 'dotenv';
import { resolve } from 'path';

// List .env file. Last override first
const envs = ['.env', 'env.local'];

(function () {
  envs.forEach((envfile) =>
    config({ path: resolve(__dirname, `../${envfile}`), override: true }),
  );
})();
export const RAJA_ONGKIR_STARTER_API =
  process.env.RAJA_ONGKIR_STARTER_API || '';
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
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
export const REDIS_URL = process.env.REDIS_URL || '';
export const REDIS_STACK_URL = process.env.REDIS_STACK_URL || '';
export const RAJA_ONGKIR_BASE_URL = process.env.RAJA_ONGKIR_BASE_URL;
export const RAJA_ONGKIR_API = process.env.RAJA_ONGKIR_API || '';
export const RAPID_API_KEY = process.env.RAPID_API_KEY || '';
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
export const MIDTRANS_CLIENT_KEY =
  process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_KEY_HERE';
export const MIDTRANS_SERVER_KEY =
  process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_KEY_HERE';
