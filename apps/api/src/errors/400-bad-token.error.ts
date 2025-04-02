import { ApiError } from './types';

export class BadTokenError extends ApiError {
  constructor(token: string) {
    super({
      errmsg: `Bad token ${token}`,
      status: 400,
    });
  }
}
