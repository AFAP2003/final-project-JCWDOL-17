import { CartController } from '@/controllers/cart.controller';
import { withAuthentication, withRole } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class CartRouter {
  private router: Router;
  private controller: CartController;

  constructor() {
    this.controller = new CartController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(withAuthentication);
    this.router.use(withRole(['USER']));

    // Cart routes
    this.router.get('/', asynchandler(this.controller.getCart));
    this.router.post('/items', asynchandler(this.controller.addToCart));
    this.router.put(
      '/items/:itemId',
      asynchandler(this.controller.updateCartItem),
    );
    this.router.delete(
      '/items/:itemId',
      asynchandler(this.controller.removeCartItem),
    );
    this.router.delete('/', asynchandler(this.controller.clearCart));
    this.router.get(
      '/total',
      asynchandler(this.controller.getCartTotalQuantity),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
