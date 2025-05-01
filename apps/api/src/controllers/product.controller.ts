import { ProductGetAllDTO } from '@/dtos/product-get-all.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { ProductService } from '@/services/product.service';
import { Request, Response } from 'express';

export class ProductController {
  private productService = new ProductService();

  getAll = async (req: Request, res: Response) => {
    const { data: dto, error } = ProductGetAllDTO.safeParse(req.query);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const products = await this.productService.getAll(dto);
      res.json(products);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
