import { Router } from 'express';
import { withAuthentication, withRole } from '@/middlewares/auth.middleware';
import orderManagementController from '@/controllers/orderManagement.controller';

export const orderManagementRouter = () => {
  const router = Router();

  router.get('/orders', orderManagementController.getOrders);
  router.get(
    '/orders/:orderNumber',
    orderManagementController.getOrderByNumber,
  );
  router.post(
    '/orders/verify-payment',
    orderManagementController.verifyPaymentProof,
  );
  router.post('/orders/ship', orderManagementController.shipOrder);
  router.post('/orders/cancel', orderManagementController.cancelOrder);
  router.get(
    '/orders/check-stock/:orderId',
    orderManagementController.checkOrderStock,
  );
  router.post(
    '/orders/auto-confirm',
    orderManagementController.autoConfirmShippedOrders,
  );

  return router;
};
