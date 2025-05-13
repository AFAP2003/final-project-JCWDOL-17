import { OrderController } from '@/controllers/order.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export const orderManagementRouter = () => {
  const router = Router();
  const controller = new OrderController();
  router.get(
    '/orders',
    withAuthentication,
    asynchandler(controller.getAdminOrders),
  );
  router.get(
    '/orders/:orderNumber',
    withAuthentication,
    asynchandler(controller.getUserOrderByNumber),
  );
  router.post(
    '/orders/verify-payment',
    withAuthentication,
    asynchandler(controller.verifyPaymentProof),
  );
  router.post(
    '/orders/process',
    withAuthentication,
    asynchandler(controller.processOrder),
  );
  router.post(
    '/orders/ship',
    withAuthentication,
    asynchandler(controller.shipOrder),
  );
  router.post(
    '/orders/cancel',
    withAuthentication,
    asynchandler(controller.adminCancelOrder),
  );
  router.get(
    '/orders/check-stock/:orderId',
    withAuthentication,
    asynchandler(controller.checkOrderStock),
  );

  return router;
};
