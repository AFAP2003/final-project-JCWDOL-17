import { CityGetAllDTO } from '@/dtos/city-get-all.dto';
import { GeoPlacesDTO } from '@/dtos/geo-places.dto';
import { ProvinceGetAllDTO } from '@/dtos/province-get-all.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { RegionService } from '@/services/region.service';
import { Request, Response } from 'express';

export class RegionController {
  private regionService = new RegionService();

  geoPlaces = async (req: Request, res: Response) => {
    const { data: dto, error } = GeoPlacesDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.regionService.geoPlaces(dto);
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
      const result = await this.regionService.provinceGetAll(dto);
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
      const result = await this.regionService.cityGetAll(dto);
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
