import { StoreController } from '@/controllers/store.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';
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
      '/nearest',
      withAuthentication,
      asynchandler(this.controller.findNearest),
    );
    this.router.post(
      '/product/check-stock',
      withAuthentication,
      asynchandler(this.controller.checkStock),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
