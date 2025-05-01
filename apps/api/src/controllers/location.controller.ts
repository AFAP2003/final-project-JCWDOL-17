import { CityGetAllDTO } from '@/dtos/city-get-all.dto';
import { GeocodingDTO } from '@/dtos/geocoding.dto';
import { ProvinceGetAllDTO } from '@/dtos/province-get-all.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { LocationService } from '@/services/location.service';
import { Request, Response } from 'express';

export class LocationController {
  private locationService = new LocationService();

  geocoding = async (req: Request, res: Response) => {
    const { data: dto, error } = GeocodingDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.locationService.geocoding(dto);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  provinceGetAll = async (req: Request, res: Response) => {
    const { data: dto, error } = ProvinceGetAllDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.locationService.provinceGetAll(dto);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  cityGetAll = async (req: Request, res: Response) => {
    const { data: dto, error } = CityGetAllDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.locationService.cityGetAll(dto);
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
