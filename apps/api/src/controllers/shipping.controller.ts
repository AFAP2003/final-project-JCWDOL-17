import { CalculateShippingDTO } from '@/dtos/calculate-shipping.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSessionUser } from '@/helpers/session-helper';
import { ShippingService } from '@/services/shipping.service';
import { Request, Response } from 'express';

export class ShippingController {
  private shippingService = new ShippingService();

  calculateShipping = async (req: Request, res: Response) => {
    const { data: dto, error } = CalculateShippingDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { user } = getSessionUser(req);
      const result = await this.shippingService.calculateShipping(user.id, dto);

      // Return detailed shipping calculation result
      res.json({
        success: true,
        message: 'Shipping calculation completed',
        data: result,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
