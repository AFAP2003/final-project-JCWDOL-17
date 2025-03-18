import { HealthController } from '@/controllers/health.controller';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class HealthRouter {
  private router: Router;
  private controller: HealthController;

  constructor() {
    this.controller = new HealthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asynchandler(this.controller.healthcheck));
  }

  getRouter(): Router {
    return this.router;
  }
}
