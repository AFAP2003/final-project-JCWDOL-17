import { UserController } from '@/controllers/user.controller';
import { withAuthentication, withRole } from '@/middlewares/auth.middleware';
import { withImageUpload } from '@/middlewares/media.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class UserRouter {
  private router: Router;
  private controller: UserController;

  constructor() {
    this.controller = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/whoami',
      withAuthentication,
      asynchandler(this.controller.whoami),
    );

    this.router.put(
      '/bio',
      withAuthentication,
      asynchandler(this.controller.updateBio),
    );

    this.router.patch(
      '/email',
      withAuthentication,
      asynchandler(this.controller.updateEmail),
    );

    this.router.post(
      '/profile',
      withAuthentication,
      withImageUpload,
      asynchandler(this.controller.postProfile),
    );

    this.router.post(
      '/address',
      withAuthentication,
      asynchandler(this.controller.createAddress),
    );
    this.router.put(
      '/address/:addressId',
      withAuthentication,
      asynchandler(this.controller.updateAddress),
    );

    this.router.get(
      '/address',
      withAuthentication,
      asynchandler(this.controller.getAllAddress),
    );

    this.router.delete(
      '/address/:addressId',
      withAuthentication,
      asynchandler(this.controller.deleteAddress),
    );

    this.router.get(
      '/available-admin',
      withAuthentication,
      withRole(['SUPER']),
      asynchandler(this.controller.getAvailableAdmin),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
