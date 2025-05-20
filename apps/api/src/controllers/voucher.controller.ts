import { VoucherCheckDTO } from '@/dtos/voucher-check.dto';
import { VoucherGetAllMeDTO } from '@/dtos/voucher-get-all-me.dto';
import {
  ApiError,
  BadRequestError,
  InternalSeverError,
  NotFoundError,
  UnprocessableEntityError,
} from '@/errors';
import { currentDate } from '@/helpers/datetime';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSession } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
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

  validateVoucher = async (req: Request, res: Response) => {
    try {
      const validationResult = VoucherCheckDTO.safeParse(req.body);

      if (!validationResult.success) {
        res.status(422).json({
          error: {
            message: 'Invalid input data',
            details: validationResult.error.format(),
          },
        });
        return;
      }

      const { code, subtotal } = validationResult.data;

      const now = currentDate();
      const voucher = await prismaclient.voucher.findFirst({
        where: {
          code,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!voucher) {
        res.status(404).json({
          error: {
            message: 'Voucher not found or has expired',
          },
        });
        return;
      }

      if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) {
        res.status(400).json({
          error: {
            message: 'This voucher has reached its usage limit',
          },
        });
        return;
      }

      if (voucher.minPurchase && subtotal < Number(voucher.minPurchase)) {
        res.status(400).json({
          error: {
            message: `A minimum purchase of ${voucher.minPurchase} is required for this voucher`,
          },
        });
        return;
      }

      let discount = 0;
      if (voucher.valueType === 'PERCENTAGE') {
        discount = (subtotal * Number(voucher.value)) / 100;

        if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
          discount = Number(voucher.maxDiscount);
        }
      } else {
        discount = Number(voucher.value);
      }

      res.status(200).json({
        success: true,
        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          type: voucher.type,
          valueType: voucher.valueType,
          discount: Math.round(discount),
          description: voucher.description || '',
          minPurchase: voucher.minPurchase,
          maxDiscount: voucher.maxDiscount,
          isForShipping: voucher.isForShipping,
          products: voucher.products,
          validUntil: voucher.endDate,
        },
      });
    } catch (err) {
      console.error('Voucher validation error:', err);
      res.status(500).json({
        error: {
          message: 'An unexpected error occurred while validating the voucher',
        },
      });
    }
  };
}
