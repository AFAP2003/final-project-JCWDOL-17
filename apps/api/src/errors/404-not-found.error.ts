import { ApiError } from './types';

export class NotFoundError extends ApiError {
  constructor(msg?: string) {
    super({
      errmsg: msg || 'the resource you are looking for cannot be found',
      status: 404,
    });
  }
}
