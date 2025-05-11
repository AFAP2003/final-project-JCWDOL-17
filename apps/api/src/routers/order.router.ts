import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { withAuthentication } from '../middlewares/auth.middleware';
import asynchandler from 'express-async-handler';
import { uploadFile } from '@/middlewares/upload-file.middleware';

export class OrderRouter {
  private router: Router;
  private controller: OrderController;

  constructor() {
    this.controller = new OrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Order creation and management
    this.router.post(
      '/',
      withAuthentication,
      asynchandler(this.controller.createOrder),
    );

    // Upload payment proof
    this.router.post(
      '/upload-payment',
      withAuthentication,
      uploadFile.single('file'),
      asynchandler(this.controller.uploadPaymentProof),
    );

    // Get user orders
    this.router.get(
      '/',
      withAuthentication,
      asynchandler(this.controller.getUserOrders),
    );

    // Search orders
    this.router.get(
      '/search',
      withAuthentication,
      asynchandler(this.controller.searchOrders),
    );

    this.router.get(
      '/:orderNumber',
      withAuthentication,
      asynchandler(this.controller.getUserOrderByNumber),
    );

    // Cancel order
    this.router.post(
      '/cancel/:orderId',
      withAuthentication,
      asynchandler(this.controller.cancelOrder),
    );

    // Confirm order
    this.router.post(
      '/confirm',
      withAuthentication,
      asynchandler(this.controller.confirmOrder),
    );

    // Apply voucher
    this.router.post(
      '/apply-voucher',
      withAuthentication,
      asynchandler(this.controller.applyVoucher),
    );

    // Admin routes
    this.router.get(
      '/admin/orders',
      withAuthentication,
      asynchandler(this.controller.getAdminOrders),
    );

    this.router.get(
      '/admin/check-stock/:orderId',
      withAuthentication,
      asynchandler(this.controller.checkOrderStock),
    );

    this.router.post(
      '/admin/process',
      withAuthentication,
      asynchandler(this.controller.processOrder),
    );

    this.router.post(
      '/admin/ship',
      withAuthentication,
      asynchandler(this.controller.shipOrder),
    );

    this.router.post(
      '/admin/cancel',
      withAuthentication,
      asynchandler(this.controller.adminCancelOrder),
    );

    this.router.post(
      '/admin/verify-payment',
      withAuthentication,
      asynchandler(this.controller.verifyPaymentProof),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
