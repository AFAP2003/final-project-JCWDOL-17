import { ApiError, InternalSeverError } from '@/errors';
import { SMTPService } from '@/services/smtp.services';
import { Request, Response } from 'express';

export class AuthController {
  private smtpservice = new SMTPService();

  signupVerification = async (req: Request, res: Response) => {
    try {
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
