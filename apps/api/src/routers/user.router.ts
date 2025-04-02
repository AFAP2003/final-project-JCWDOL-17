import { UserController } from '@/controllers/user.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';
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
  }

  getRouter(): Router {
    return this.router;
  }
}
