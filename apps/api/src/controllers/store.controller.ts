import { StoreCheckStockDTO } from '@/dtos/store-check-stock.dto';
import { StoreFindNearestDTO } from '@/dtos/store-find-nearest.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { StoreService } from '@/services/store.service';
import { Request, Response } from 'express';

export class StoreController {
  private storeService = new StoreService();

  findNearest = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreFindNearestDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const store = await this.storeService.findNearest(dto);
      if (!store) {
        res.json({
          message: 'No store available at current point',
          store: null,
        });
        return;
      }

      res.json({
        message: 'Success',
        store: store,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  checkStock = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreCheckStockDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const productStoks = await this.storeService.checkStock(dto);
      res.json(productStoks);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
