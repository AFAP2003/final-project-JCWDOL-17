import { auth } from '@/auth';
import { UnauthorizedError } from '@/errors';
import { fromNodeHeaders } from 'better-auth/node';
import { NextFunction, Request, Response } from 'express';

export const withAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new UnauthorizedError('Invalid or missing access token');
    }
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

export const withRole = (roles: ('USER' | 'ADMIN' | 'SUPER')[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session)
        throw new UnauthorizedError(
          'You are not permitted to access this resource',
        );

      const match = roles.find(
        (permittedrole) => req.session?.user.role === permittedrole,
      );
      if (!match)
        throw new UnauthorizedError(
          'You are not permitted to access this resource',
        );

      next();
    } catch (error) {
      next(error);
    }
  };
};
