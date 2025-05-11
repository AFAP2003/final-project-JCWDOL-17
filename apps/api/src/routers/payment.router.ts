import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { withAuthentication } from '../middlewares/auth.middleware';
import asynchandler from 'express-async-handler';

export class PaymentRouter {
  private router: Router;
  private orderController: OrderController;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/initialize',
      withAuthentication,
      asynchandler(this.orderController.initializePayment),
    );

    this.router.post(
      '/webhook/midtrans',
      asynchandler(this.orderController.midtransWebhook),
    );

    this.router.post(
      '/apply-voucher',
      withAuthentication,
      asynchandler(this.orderController.applyVoucher),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
