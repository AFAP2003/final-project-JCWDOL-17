import { VoucherApplicableShippingDTO } from '@/dtos/voucher-applicable-shipping.dto';
import { VoucherApplicableShoppingDTO } from '@/dtos/voucher-applicable-shopping.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSession } from '@/helpers/session-helper';
import { VoucherService } from '@/services/voucher.service';
import { Request, Response } from 'express';

export class VoucherController {
  private voucherService = new VoucherService();

  applicableShoppingVouchers = async (req: Request, res: Response) => {
    const { user } = getSession(req);
    const { data: dto, error } = VoucherApplicableShoppingDTO.safeParse(
      req.body,
    );
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.voucherService.applicableShoppingVouchers(
        dto,
        user,
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

  applicableShippingVouchers = async (req: Request, res: Response) => {
    const { user } = getSession(req);
    const { data: dto, error } = VoucherApplicableShippingDTO.safeParse(
      req.body,
    );
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.voucherService.applicableShippingVouchers(
        dto,
        user,
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
}
