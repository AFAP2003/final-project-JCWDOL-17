import { ApiError, InternalSeverError } from '@/errors';
import orderManagementService from '@/services/orderManagement.service';
import { NextFunction, Request, Response } from 'express';

class OrderManagementController {
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;

      const filters = {
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        orderNumber: req.query.orderNumber as string,
        storeId: req.query.storeId as string,
      };

      const { total, data } = await orderManagementService.listAllOrders(
        page,
        take,
        filters,
      );

      res.status(200).send({
        success: true,
        message: 'Orders fetched successfully',
        data,
        pagination: {
          currentPage: page,
          pageSize: take,
          totalItems: total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params;
      const data = await orderManagementService.getOrderByNumber(orderNumber);

      res.status(200).send({
        success: true,
        message: 'Order fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentProofId, approved, notes } = req.body;

      const data = await orderManagementService.verifyPaymentProof(
        orderId,
        paymentProofId,
        approved,
        notes,
      );

      res.status(200).send({
        success: true,
        message: `Payment proof ${approved ? 'approved' : 'rejected'} successfully`,
        data,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      next(error);
    }
  }

  async shipOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await orderManagementService.shipOrder(
        req.body.orderId,
        req.body.trackingNumber,
        req.body.notes,
      );

      res.status(200).send({
        success: true,
        message: 'Order shipped successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, reason, adminId } = req.body;

      const data = await orderManagementService.cancelOrder(
        orderId,
        adminId,
        reason,
      );

      res.status(200).send({
        success: true,
        message: 'Order cancelled successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkOrderStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      const data = await orderManagementService.checkOrderStock(orderId);

      res.status(200).send({
        success: true,
        message: 'Order stock checked successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async autoConfirmShippedOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await orderManagementService.autoConfirmShippedOrders();

      res.status(200).send({
        success: true,
        message: `Auto-confirmed ${data.processed} shipped orders`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderManagementController();
