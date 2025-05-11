import { Router } from 'express';
import { WebhookController } from '@/controllers/webhook.controller';
import asynchandler from 'express-async-handler';

export class WebhookRouter {
  private router: Router;
  private webhookController: WebhookController;

  constructor() {
    this.router = Router();
    this.webhookController = new WebhookController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/midtrans',
      asynchandler(this.webhookController.midtransWebhook),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
