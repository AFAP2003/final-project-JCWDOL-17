import { VoucherController } from '@/controllers/voucher.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class VoucherRouter {
  private router: Router;
  private controller: VoucherController;

  constructor() {
    this.controller = new VoucherController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/applicable/shopping',
      withAuthentication,
      asynchandler(this.controller.applicableShoppingVouchers),
    );

    this.router.post(
      '/applicable/shipping',
      withAuthentication,
      asynchandler(this.controller.applicableShippingVouchers),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
