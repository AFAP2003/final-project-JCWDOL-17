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
    this.router.get(
      '/signup/confirmation',
      asynchandler(this.controller.signupVerification),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
