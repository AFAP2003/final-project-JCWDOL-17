import { ProductController } from '@/controllers/product.controller';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class ProductRouter {
  private router: Router;
  private controller: ProductController;

  constructor() {
    this.controller = new ProductController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asynchandler(this.controller.getAll));
    this.router.get('/:productId', asynchandler(this.controller.getById));
    this.router.get(
      '/:productId/category/similar',
      asynchandler(this.controller.getSimilarByCategory),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
