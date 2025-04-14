import { AuthController } from '@/controllers/auth.controller';
import { withAuthentication } from '@/middlewares/auth.middleware';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class AuthRouter {
  private router: Router;
  private controller: AuthController;

  constructor() {
    this.controller = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/signup/confirm',
      asynchandler(this.controller.signupCredConfirm),
    );
    this.router.post('/signup', asynchandler(this.controller.signup));

    this.router.post(
      '/signin/confirm',
      asynchandler(this.controller.signinCredConfirm),
    );
    this.router.post('/signin', asynchandler(this.controller.signin));

    this.router.post(
      '/forgot-password',
      asynchandler(this.controller.forgotPassword),
    );
    this.router.post(
      '/reset-password',
      asynchandler(this.controller.resetPassword),
    );

    this.router.get(
      '/sessions',
      withAuthentication,
      asynchandler(this.controller.listSession),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
