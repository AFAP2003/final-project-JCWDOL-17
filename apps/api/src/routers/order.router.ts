import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken } from '../middlewares/authenticate-token';
import { uploadFile } from '../middlewares/upload-file';

const orderRouter = Router();
const orderController = new OrderController();

// User routes
orderRouter.post('/', authenticateToken, orderController.createOrder);
orderRouter.post(
  '/upload-payment',
  authenticateToken,
  uploadFile.single('file'),
  orderController.uploadPaymentProof,
);
orderRouter.get('/', authenticateToken, orderController.getUserOrders);
orderRouter.get(
  '/:orderId',
  authenticateToken,
  orderController.getUserOrderById,
);
orderRouter.post(
  '/cancel/:orderId',
  authenticateToken,
  orderController.cancelOrder,
);
orderRouter.post('/confirm', authenticateToken, orderController.confirmOrder);

// Admin routes
orderRouter.get(
  '/admin/orders',
  authenticateToken,
  orderController.getAdminOrders,
);
orderRouter.get(
  '/admin/check-stock/:orderId',
  authenticateToken,
  orderController.checkOrderStock,
);
orderRouter.post(
  '/admin/process',
  authenticateToken,
  orderController.processOrder,
);
orderRouter.post('/admin/ship', authenticateToken, orderController.shipOrder);
orderRouter.post(
  '/admin/cancel',
  authenticateToken,
  orderController.adminCancelOrder,
);
orderRouter.post(
  '/admin/verify-payment',
  authenticateToken,
  orderController.verifyPaymentProof,
);

export { orderRouter };
