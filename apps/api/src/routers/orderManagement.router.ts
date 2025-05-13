import { Router } from 'express';
import { withAuthentication, withRole } from '@/middlewares/auth.middleware';
import orderManagementController from '@/controllers/orderManagement.controller';

export const orderManagementRouter = () => {
  const router = Router();

  router.get(
    '/orders',
    withAuthentication,
    orderManagementController.getOrders,
  );
  router.get(
    '/orders/:orderNumber',
    withAuthentication,
    orderManagementController.getOrderByNumber,
  );
  router.post(
    '/orders/verify-payment',
    withAuthentication,
    withRole(['ADMIN', 'SUPER']),
    orderManagementController.verifyPaymentProof,
  );
  router.post(
    '/orders/ship',
    withAuthentication,
    withRole(['ADMIN', 'SUPER']),
    orderManagementController.shipOrder,
  );
  router.post(
    '/orders/cancel',
    withAuthentication,
    withRole(['ADMIN', 'SUPER']),
    orderManagementController.cancelOrder,
  );
  router.get(
    '/orders/check-stock/:orderId',
    withAuthentication,
    withRole(['ADMIN', 'SUPER']),
    orderManagementController.checkOrderStock,
  );
  router.post(
    '/orders/auto-confirm',
    withAuthentication,
    withRole(['ADMIN', 'SUPER']),
    orderManagementController.autoConfirmShippedOrders,
  );

  return router;
};
