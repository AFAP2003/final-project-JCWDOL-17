import { ProductCategoryGetAllDTO } from '@/dtos/product-category-get-all.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { ProductCategoryService } from '@/services/product-category.service';
import { Request, Response } from 'express';

export class ProductCategoryController {
  private productCategoryService = new ProductCategoryService();

  getAll = async (req: Request, res: Response) => {
    const { data: dto, error } = ProductCategoryGetAllDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const categories = await this.productCategoryService.getAll(dto);
      res.json(categories);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
