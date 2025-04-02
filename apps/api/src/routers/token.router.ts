import { TokenController } from '@/controllers/token.controller';
import { Router } from 'express';
import asynchandler from 'express-async-handler';

export class TokenRouter {
  private router: Router;
  private controller: TokenController;

  constructor() {
    this.controller = new TokenController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/exchange', asynchandler(this.controller.exchange));
  }

  getRouter(): Router {
    return this.router;
  }
}
