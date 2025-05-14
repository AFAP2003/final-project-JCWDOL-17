import { Router } from 'express';
import { ShippingMethodController } from '@/controllers/shipping-method.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';

export class ShippingMethodRouter {
  private router: Router;
  private shippingMethodController = new ShippingMethodController();

  constructor() {
    this.router = Router();
    this.configure();
  }

  private configure(): void {
    // Public endpoints
    this.router.get('/', this.shippingMethodController.getAll);
    this.router.get('/:id', this.shippingMethodController.getById);

    // Admin endpoints
    this.router.post(
      '/',
      withAuthentication,
      this.shippingMethodController.create,
    );
    this.router.put(
      '/:id',
      withAuthentication,
      this.shippingMethodController.update,
    );
    this.router.delete(
      '/:id',
      withAuthentication,
      this.shippingMethodController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
