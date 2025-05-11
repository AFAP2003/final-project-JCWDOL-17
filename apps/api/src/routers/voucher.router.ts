import { VoucherController } from '@/controllers/voucher.controller';
import { Router } from 'express';

export class VoucherRouter {
  private router: Router;
  private controller: VoucherController;

  constructor() {
    this.controller = new VoucherController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {}

  getRouter(): Router {
    return this.router;
  }
}
