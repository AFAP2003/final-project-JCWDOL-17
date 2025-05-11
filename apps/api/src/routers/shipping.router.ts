import { ShippingController } from '@/controllers/shipping.controller';
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
    this.router.post('/cost', asynchandler(this.controller.shippingCost));
  }

  getRouter(): Router {
    return this.router;
  }
}
