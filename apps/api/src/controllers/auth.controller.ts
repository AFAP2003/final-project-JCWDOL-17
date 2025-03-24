import {
  SignupBasicConfirmationDTO,
  SignupBasicResendEmailDTO,
  SignupDTO,
} from '@/dtos/signup.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { AuthService } from '@/services/auth.service';
import { Request, Response } from 'express';

export class AuthController {
  private authService = new AuthService();

  signupBasicConfirmation = async (req: Request, res: Response) => {
    const { data: dto, error } = SignupBasicConfirmationDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.signupBasicConfirmation(dto);
      res.json({
        message: `signup confirmation email was sent on ${dto.email}`,
        email: dto.email,
        ...result,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  signupBasicResendEmail = async (req: Request, res: Response) => {
    const { data: dto, error } = SignupBasicResendEmailDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.signupBasicResendEmail(dto);
      res.json({
        message: `signup confirmation email was sent on ${dto.email}`,
        email: dto.email,
        ...result,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  signup = async (req: Request, res: Response) => {
    const { data: dto, error } = SignupDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.signup(dto, req, res);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
