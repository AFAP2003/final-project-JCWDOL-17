import { ShippingController } from '@/controllers/shipping.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class ShippingRouter {
  private router: Router;
  private controller: ShippingController;

  constructor() {
    this.controller = new ShippingController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/calculation',
      withAuthentication,
      asynchandler(this.controller.calculateShipping),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
