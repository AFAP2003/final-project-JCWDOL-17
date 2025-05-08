import { CreateOrderDTO } from '@/dtos/create-order.dto';
import {
  ApiError,
  BadRequestError,
  ForbiddenError,
  InternalSeverError,
  NotFoundError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import { OrderService } from '@/services/order.service';
import { PaymentService } from '@/services/payment.service';
import { PaymentMethod } from '@prisma/client';
import { Request, Response } from 'express';
import midtransClient from 'midtrans-client';

export class OrderController {
  private orderService = new OrderService();

  createOrder = async (req: Request, res: Response) => {
    const { data: dto, error } = CreateOrderDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { user } = getSessionUser(req);
      const order = await this.orderService.createOrder(user.id, dto);
      res.json(order);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  uploadPaymentProof = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId } = req.body;
      const file = req.file;

      if (!file) {
        throw new BadRequestError('Payment proof file is required');
      }

      const result = await this.orderService.uploadPaymentProof(user.id, {
        orderId,
        file,
      });

      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getUserOrders = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const {
        status,
        page = 1,
        limit = 10,
        startDate,
        endDate,
        orderNumber,
      } = req.query;

      const filters: any = {
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        orderNumber: orderNumber as string,
      };

      const orders = await this.orderService.getUserOrders(
        user.id,
        filters,
        Number(page),
        Number(limit),
      );

      res.json(orders);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  cancelOrder = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId } = req.params;
      const result = await this.orderService.cancelOrder(user.id, orderId);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  confirmOrder = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId } = req.body;
      const result = await this.orderService.confirmOrder(user.id, orderId);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  verifyPaymentProof = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId, paymentProofId, approved, notes } = req.body;

      // Verify admin permissions
      await this.validateAdminPermission(user.id);

      // Call service method to verify payment
      const result = await this.orderService.verifyPaymentProof(
        user.id,
        orderId,
        paymentProofId,
        approved,
        notes,
      );

      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  checkOrderStock = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId } = req.params;

      // Verify admin permissions
      await this.validateAdminPermission(user.id);

      // Check stock availability for this order
      const result = await this.orderService.checkOrderStock(orderId);

      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getAdminOrders = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);

      // Get the admin's store (if they're a store admin)
      const adminStore = await this.orderService.getAdminStore(user.id);
      const storeId = adminStore?.id;

      // Extract query parameters
      const {
        status,
        storeId: requestedStoreId,
        page = 1,
        limit = 10,
        startDate,
        endDate,
        orderNumber,
      } = req.query;

      // Store admins can only see orders for their store
      // Super admins can see all orders or filter by specific store
      const effectiveStoreId =
        user.role === 'SUPER' ? (requestedStoreId as string) : storeId;

      const filters: any = {
        status: status as string,
        storeId: effectiveStoreId,
        startDate: startDate as string,
        endDate: endDate as string,
        orderNumber: orderNumber as string,
      };

      const orders = await this.orderService.getAdminOrders(
        filters,
        Number(page),
        Number(limit),
      );

      res.json(orders);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  processOrder = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId, paymentProofId, verifyPayment, notes } = req.body;

      // Verify admin permissions
      await this.validateAdminPermission(user.id);

      // Process the order
      const result = await this.orderService.processOrder(user.id, {
        orderId,
        paymentProofId,
        verifyPayment,
        notes,
      });

      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  shipOrder = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId, trackingNumber, notes } = req.body;

      // Verify admin permissions
      await this.validateAdminPermission(user.id);

      // Ship the order
      const result = await this.orderService.shipOrder(user.id, {
        orderId,
        trackingNumber,
        notes,
      });

      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  adminCancelOrder = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId, reason } = req.body;

      // Verify admin permissions
      await this.validateAdminPermission(user.id);

      // Cancel the order
      const result = await this.orderService.adminCancelOrder(
        user.id,
        orderId,
        reason,
      );

      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  // Helper method to validate admin permissions
  private validateAdminPermission = async (userId: string) => {
    const user = await prismaclient.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER')) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
      );
    }

    return user;
  };

  applyVoucher = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderId, voucherCode } = req.body;

      if (!orderId || !voucherCode) {
        throw new BadRequestError('Order ID and voucher code are required');
      }

      const result = await this.orderService.applyVoucher(
        orderId,
        voucherCode,
        user.id,
      );
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  searchOrders = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { query } = req.query;
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);

      if (!query) {
        return this.getUserOrders(req, res);
      }

      const orders = await this.orderService.searchOrders(
        user.id,
        query as string,
        page,
        limit,
      );

      res.json(orders);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getUserOrderByNumber = async (req: Request, res: Response) => {
    try {
      const { user } = getSessionUser(req);
      const { orderNumber } = req.params;

      console.log('Fetching order with number:', orderNumber);

      if (!orderNumber) {
        throw new BadRequestError('Order number is required');
      }

      const order = await prismaclient.order.findFirst({
        where: {
          orderNumber: orderNumber,
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isMain: true },
                    take: 1,
                  },
                },
              },
            },
          },
          store: true,
          paymentProofs: true,
          address: true,
          appliedVouchers: {
            include: {
              voucher: true,
            },
          },
          PaymentGateway: true,
        },
      });

      if (!order) {
        throw new NotFoundError();
      }

      res.json(order);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  initializePayment = async (req: Request, res: Response): Promise<void> => {
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const { addressId, shippingMethodId, vouchers, notes } = req.body;

    // Type assertion to tell TypeScript this is a user
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const order = await this.orderService.createOrder(user.id, {
      addressId,
      shippingMethodId,
      vouchers,
      notes,
      paymentMethod: PaymentMethod.PAYMENT_GATEWAY,
    });

    const grossAmount = order.total;
    const orderId = order.orderNumber;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ snapToken: transaction.token });
  };

  midtransWebhook = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      // Handle the Midtrans webhook response (status updates, etc.)
      const paymentService = new PaymentService();
      await paymentService.handleMidtransWebhook(payload);

      // Respond 200 to Midtrans to acknowledge receipt
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Midtrans webhook error:', error);
      res.status(200).json({
        status: 'error',
        message: 'Webhook error, but acknowledged to prevent retry',
      });
    }
  };
}
