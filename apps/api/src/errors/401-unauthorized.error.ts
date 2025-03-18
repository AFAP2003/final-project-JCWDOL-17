import { ApiError } from './types';

export class UnauthorizedError extends ApiError {
  constructor(errmsg: string = 'Unauthorized, invalid or missing credentials') {
    super({
      errmsg,
      status: 401,
    });
  }
}
