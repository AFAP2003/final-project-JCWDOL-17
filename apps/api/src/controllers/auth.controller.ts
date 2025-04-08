import { ForgotPasswordDTO } from '@/dtos/forgot-password.dto';
import { ResetPasswordDTO } from '@/dtos/reset-password.dto';
import { SigninCredConfirmDTO, SigninDTO } from '@/dtos/signin.dto';
import { SignupCredConfirmDTO, SignupDTO } from '@/dtos/signup.dto';
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

  signupCredConfirm = async (req: Request, res: Response) => {
    const { data: dto, error } = SignupCredConfirmDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      await this.authService.signupCredConfirm(dto);
      res.json({ message: `Verification email has been sent to ${dto.email}` });
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
      const result = await this.authService.signup(dto, req);
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  signinCredConfirm = async (req: Request, res: Response) => {
    const { data: dto, error } = SigninCredConfirmDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      await this.authService.signinCredConfirm(dto);
      res.json({ message: `Verification email has been sent to ${dto.email}` });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  signin = async (req: Request, res: Response) => {
    const { data: dto, error } = SigninDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.signin(dto, req);
      if (result.signinMethod === 'CREDENTIAL') {
        const { headers } = result;
        headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
      }

      res.json({ ...result });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { data: dto, error } = ForgotPasswordDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      await this.authService.forgotPassword(dto);
      res.json({ message: `Verification email has been sent to ${dto.email}` });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const { data: dto, error } = ResetPasswordDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { userId } = await this.authService.resetPassword(dto);
      res.json({ message: `New password has been updated for user ${userId}` });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  listSession = async (req: Request, res: Response) => {
    try {
      const sessions = await this.authService.listSession(req);
      res.json(sessions);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
