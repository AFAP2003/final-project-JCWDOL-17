import { ApiError } from './types';

export class ForbiddenError extends ApiError {
  constructor(
    errmsg: string = 'Forbidden, insufficient permissions to access the resource',
  ) {
    super({
      errmsg,
      status: 403,
    });
  }
}
