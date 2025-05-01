import { CreateOrderDTO } from '@/dtos/create-order.dto';
import {
  ApiError,
  BadRequestError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
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
}
