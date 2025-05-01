import { OrderController } from '@/controllers/order.controller';
import { withAuthentication, withRole } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
});

export class OrderRouter {
  private router: Router;
  private controller: OrderController;

  constructor() {
    this.controller = new OrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // User routes
    this.router.post(
      '/',
      withAuthentication,
      withRole(['USER']),
      asynchandler(this.controller.createOrder),
    );

    this.router.get(
      '/',
      withAuthentication,
      withRole(['USER']),
      asynchandler(this.controller.getUserOrders),
    );

    this.router.get(
      '/:orderId',
      withAuthentication,
      withRole(['USER']),
      asynchandler(this.controller.getOrderById),
    );

    this.router.post(
      '/payment-proof',
      withAuthentication,
      withRole(['USER']),
      upload.single('file'),
      asynchandler(this.controller.uploadPaymentProof),
    );

    this.router.post(
      '/confirm',
      withAuthentication,
      withRole(['USER']),
      asynchandler(this.controller.confirmOrder),
    );

    this.router.post(
      '/:orderId/cancel',
      withAuthentication,
      withRole(['USER']),
      asynchandler(this.controller.cancelOrder),
    );

    // Admin routes
    this.router.get(
      '/admin',
      withAuthentication,
      withRole(['ADMIN', 'SUPER']),
      asynchandler(this.controller.getAdminOrders),
    );

    this.router.post(
      '/admin/process',
      withAuthentication,
      withRole(['ADMIN', 'SUPER']),
      asynchandler(this.controller.processOrder),
    );

    this.router.post(
      '/admin/ship',
      withAuthentication,
      withRole(['ADMIN', 'SUPER']),
      asynchandler(this.controller.shipOrder),
    );

    this.router.post(
      '/admin/:orderId/cancel',
      withAuthentication,
      withRole(['ADMIN', 'SUPER']),
      asynchandler(this.controller.adminCancelOrder),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
