import {
  ApiError,
  BadRequestError,
  InternalSeverError,
  NotFoundError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import { Request, Response } from 'express';
import { z } from 'zod';

const ShippingMethodCreateUpdateDTO = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  baseCost: z.number().min(0, 'Base cost must be a positive number'),
  isActive: z.boolean().default(true),
});

export class ShippingMethodController {
  getAll = async (req: Request, res: Response) => {
    try {
      const shippingMethods = await prismaclient.shippingMethod.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          baseCost: 'asc',
        },
      });

      res.json(shippingMethods);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const shippingMethod = await prismaclient.shippingMethod.findUnique({
        where: { id },
      });

      if (!shippingMethod) {
        throw new NotFoundError('Shipping method not found');
      }

      res.json(shippingMethod);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { data: dto, error } = ShippingMethodCreateUpdateDTO.safeParse(
        req.body,
      );
      if (error) {
        throw new UnprocessableEntityError(formatZodError(error));
      }

      const { user } = getSessionUser(req);

      const shippingMethod = await prismaclient.shippingMethod.create({
        data: {
          name: dto.name,
          description: dto.description || '',
          baseCost: dto.baseCost,
          isActive: dto.isActive,
        },
      });

      res.status(201).json(shippingMethod);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { data: dto, error } = ShippingMethodCreateUpdateDTO.safeParse(
        req.body,
      );
      if (error) {
        throw new UnprocessableEntityError(formatZodError(error));
      }

      const { user } = getSessionUser(req);
      if (user.role !== ('ADMIN' as any) && user.role !== ('SUPER' as any)) {
        throw new BadRequestError('Only admins can update shipping methods');
      }

      const existingMethod = await prismaclient.shippingMethod.findUnique({
        where: { id },
      });

      if (!existingMethod) {
        throw new NotFoundError('Shipping method not found');
      }

      const updatedMethod = await prismaclient.shippingMethod.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description || existingMethod.description,
          baseCost: dto.baseCost,
          isActive: dto.isActive,
        },
      });

      res.json(updatedMethod);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { user } = getSessionUser(req);
      if (user.role !== ('ADMIN' as any) && user.role !== ('SUPER' as any)) {
        throw new BadRequestError('Only admins can delete shipping methods');
      }

      const existingMethod = await prismaclient.shippingMethod.findUnique({
        where: { id },
      });

      if (!existingMethod) {
        throw new NotFoundError('Shipping method not found');
      }

      await prismaclient.shippingMethod.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ message: 'Shipping method deleted successfully' });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
