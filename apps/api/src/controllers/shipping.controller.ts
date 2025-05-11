import { ShippingCostDTO } from '@/dtos/shipping-cost.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { ShippingService } from '@/services/shipping.service';
import { Request, Response } from 'express';

export class ShippingController {
  private shippingService = new ShippingService();

  shippingCost = async (req: Request, res: Response) => {
    const { data: dto, error } = ShippingCostDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.shippingService.shippingCost(dto);
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
