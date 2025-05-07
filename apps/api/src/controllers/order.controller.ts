import { CreateOrderDTO } from '@/dtos/create-order.dto';
import {
  ApiError,
  BadRequestError,
  ForbiddenError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import { OrderService } from '@/services/order.service';
import { Request, Response } from 'express';

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
}
