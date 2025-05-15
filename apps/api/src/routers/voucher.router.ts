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
    this.router.get(
      '/me',
      withAuthentication,
      asynchandler(this.controller.getAllMyVoucher),
    );
    this.router.post(
      '/validate',
      withAuthentication,
      asynchandler(this.controller.validateVoucher),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
