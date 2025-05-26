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

    this.router.post(
      '/confirm-email',
      asynchandler(this.controller.confirmEmail),
    );

    this.router.post(
      '/resend-confirm-email',
      asynchandler(this.controller.resendConfirmEmail),
    );

    this.router.get(
      '/sessions',
      withAuthentication,
      asynchandler(this.controller.getAllSession),
    );

    this.router.post(
      '/sessions/revoke',
      withAuthentication,
      asynchandler(this.controller.revokeSession),
    );

    this.router.get(
      '/accounts',
      withAuthentication,
      asynchandler(this.controller.getAllAccount),
    );

    this.router.post(
      '/accounts/link',
      withAuthentication,
      asynchandler(this.controller.accountLink),
    );

    this.router.post(
      '/check-password',
      withAuthentication,
      asynchandler(this.controller.checkPassword),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
