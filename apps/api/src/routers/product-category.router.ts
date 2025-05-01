import { ProductCategoryController } from '@/controllers/product-category.controller';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class ProductCategoryRouter {
  private router: Router;
  private controller: ProductCategoryController;

  constructor() {
    this.controller = new ProductCategoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', asynchandler(this.controller.getAll));
  }

  getRouter(): Router {
    return this.router;
  }
}
