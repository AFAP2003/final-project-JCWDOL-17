import { StoreChangeStatusDTO } from '@/dtos/store-chnage-status.dto';
import { StoreCreateDTO } from '@/dtos/store-create-dto';
import { StoreGetAllDTO } from '@/dtos/store-get-all.dto';
import { StoreGetByIdDTO } from '@/dtos/store-get-by-id.dto';
import { StoreUpdateDTO } from '@/dtos/store-update.dto';
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

  getById = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreGetByIdDTO.safeParse(req.params);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.storeService.getById(dto);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  changeStatus = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreChangeStatusDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.storeService.changeStatus(dto);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  updateStore = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreUpdateDTO.safeParse({
      ...req.body,
      ...req.params,
    });
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.storeService.updateStore(dto);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  create = async (req: Request, res: Response) => {
    const { data: dto, error } = StoreCreateDTO.safeParse({
      ...req.body,
    });
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.storeService.createStore(dto);
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
