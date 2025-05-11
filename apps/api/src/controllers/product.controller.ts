import { ProductGetAllDTO } from '@/dtos/product-get-all.dto';
import { ProductGetByIdDTO } from '@/dtos/product-get-by-id.dto';
import { ProductSimilarCategoryDTO } from '@/dtos/product-similar-category.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { CartService } from '@/services/cart.service';
import { ProductCategoryService } from '@/services/product-category.service';
import { ProductService } from '@/services/product.service';
import { Request, Response } from 'express';

export class ProductController {
  private productService = new ProductService();
  private categoryService = new ProductCategoryService();
  private cartService = new CartService();

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

  getById = async (req: Request, res: Response) => {
    const { data: dto, error } = ProductGetByIdDTO.safeParse(req.params);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const product = await this.productService.getById(dto);
      res.json(product);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getSimilarByCategory = async (req: Request, res: Response) => {
    const { data: dto, error } = ProductSimilarCategoryDTO.safeParse({
      ...req.params,
      ...req.query,
    });
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const product = await this.productService.getById({
        productId: dto.productId,
      });
      const products = await this.productService.getAll(
        {
          orderBy: dto.orderBy,
          category: [product.category.name],
          page: dto.page,
          pageSize: dto.pageSize,
        },
        {
          excludeIds: [product.id],
        },
      );
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
