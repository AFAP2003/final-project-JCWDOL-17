import { AccountLinkDTO } from '@/dtos/account-link.dto';
import { CheckPasswordDTO } from '@/dtos/check-password.dto';
import { ConfirmEmailDTO } from '@/dtos/confirm-email.dto';
import { ForgotPasswordDTO } from '@/dtos/forgot-password.dto';
import { ResendConfirmEmailDTO } from '@/dtos/resend-confirm-email.dto';
import { ResetPasswordDTO } from '@/dtos/reset-password.dto';
import { RevokeSessionDTO } from '@/dtos/revoke-session.dto';
import { SigninCredConfirmDTO, SigninDTO } from '@/dtos/signin.dto';
import { SignupCredConfirmDTO, SignupDTO } from '@/dtos/signup.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { getSession } from '@/helpers/session-helper';
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
      const { url } = await this.authService.signupCredConfirm(dto);
      res.json({
        message: `Verification email has been sent to ${dto.email}`,
        url,
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
      const { url } = await this.authService.signinCredConfirm(dto);
      res.json({
        message: `Verification email has been sent to ${dto.email}`,
        url,
      });
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
      const { url } = await this.authService.forgotPassword(dto);
      res.json({
        message: `Verification email has been sent to ${dto.email}`,
        url,
      });
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
      const { userId } = await this.authService.resetPassword(dto, req);
      res.json({ message: `New password has been updated for user ${userId}` });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getAllSession = async (req: Request, res: Response) => {
    try {
      const sessions = await this.authService.getAllSession(req);
      res.json(sessions);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  revokeSession = async (req: Request, res: Response) => {
    const { data: dto, error } = RevokeSessionDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const { status: OK } = await this.authService.revokeSession(dto, req);
      if (!OK) {
        throw new InternalSeverError(
          `error revoking session with token ${dto.sessionToken}`,
        );
      }
      res.json({ message: `Session revoked for token ${dto.sessionToken}` });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  getAllAccount = async (req: Request, res: Response) => {
    try {
      const accounts = await this.authService.getAllAccount(req);
      res.json(accounts);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  accountLink = async (req: Request, res: Response) => {
    const session = getSession(req);
    const { data: dto, error } = AccountLinkDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.accountLink(dto, session, req);

      if (result.method === 'CREDENTIAL') {
        res.json({
          message: `Verification email has been sent to ${session.user.email}`,
          url: result.url,
        });
      } else {
        res.json({
          redirect: result.redirect,
          url: result.url,
        });
      }
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  checkPassword = async (req: Request, res: Response) => {
    const session = getSession(req);
    const { data: dto, error } = CheckPasswordDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const match = await this.authService.checkPassword(dto, session.user.id);
      res.json({
        message: match ? 'Password match' : 'Password not match',
        match: match,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  confirmEmail = async (req: Request, res: Response) => {
    const { data: dto, error } = ConfirmEmailDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.confirmEmail(dto, req);
      if (result?.withPassword) {
        const { headers } = result;
        headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
      }
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };

  resendConfirmEmail = async (req: Request, res: Response) => {
    const { data: dto, error } = ResendConfirmEmailDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const result = await this.authService.resendConfirmEmail(dto);
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
