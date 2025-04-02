import { ApiError } from './types';

export class TooManyRequestError extends ApiError {
  constructor() {
    super({
      errmsg: 'Too many request for current action, try again later!',
      status: 400,
    });
  }
}
