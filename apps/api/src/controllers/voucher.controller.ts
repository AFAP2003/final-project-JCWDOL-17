import { VoucherGetAllMeDTO } from '@/dtos/voucher-get-all-me.dto';
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

  getAllMyVoucher = async (req: Request, res: Response) => {
    const session = getSession(req);
    const { data: dto, error } = VoucherGetAllMeDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.voucherService.getAllMyVoucher(
        dto,
        session.user,
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
