import { AuthController } from '@/controllers/auth.controller';
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
      '/signup/basic/confirm',
      asynchandler(this.controller.signupBasicConfirmation),
    );
    this.router.post(
      '/signup/basic/resend',
      asynchandler(this.controller.signupBasicResendEmail),
    );

    this.router.post('/signup', asynchandler(this.controller.signup));

    this;
  }

  getRouter(): Router {
    return this.router;
  }
}
