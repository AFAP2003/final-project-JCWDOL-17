import { ApiError, InternalSeverError } from '@/errors';
import { getSession } from '@/helpers/session-helper';
import { Request, Response } from 'express';

export class UserController {
  whoami = async (req: Request, res: Response) => {
    try {
      const session = getSession(req);
      res.json(session);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
