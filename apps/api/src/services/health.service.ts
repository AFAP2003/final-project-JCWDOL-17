import App from '@/app';
import { NODE_ENV } from '@/config';

export class HealthService {
  healthcheck = async () => {
    return {
      version: App.VERSION,
      env: NODE_ENV,
      status: 'OK',
    };
  };
}
