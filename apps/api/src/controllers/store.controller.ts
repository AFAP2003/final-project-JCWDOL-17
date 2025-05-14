import { StoreGetAllDTO } from '@/dtos/store-get-all.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { StoreService } from '@/services/stores.service';
import { Request, Response } from 'express';

export class StoreController {
  private storeService = new StoreService();

  getAll = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreGetAllDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.storeService.getAllStore(dto);
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
