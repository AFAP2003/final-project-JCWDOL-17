import { StoreController } from '@/controllers/store.controller';
import { withAuthentication, withRole } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class StoreRouter {
  private router: Router;
  private controller: StoreController;

  constructor() {
    this.controller = new StoreController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      withAuthentication,
      withRole(['SUPER']),
      asynchandler(this.controller.getAll),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
