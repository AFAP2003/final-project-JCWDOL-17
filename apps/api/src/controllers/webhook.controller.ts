import { ApiError } from '@/errors';
import { PaymentService } from '@/services/payment.service';
import { Request, Response } from 'express';

export class WebhookController {
  private paymentService = new PaymentService();

  midtransWebhook = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      await this.paymentService.handleMidtransWebhook(payload);

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Error processing Midtrans webhook:', error);

      if (!(error instanceof ApiError)) {
        const err = error as Error;
        console.error('Internal server error:', err.message);
      }

      res
        .status(200)
        .json({ status: 'error', message: 'Error processing webhook' });
    }
  };
}
