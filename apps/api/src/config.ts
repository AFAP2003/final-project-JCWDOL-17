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
