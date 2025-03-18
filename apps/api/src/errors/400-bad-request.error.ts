import { ApiError } from './types';

export class BadRequestError extends ApiError {
  constructor(errmsg: string = 'Bad Request') {
    super({
      errmsg,
      status: 400,
    });
  }
}
