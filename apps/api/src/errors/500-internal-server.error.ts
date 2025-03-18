import { ApiError } from './types';

export class InternalSeverError extends ApiError {
  constructor(error: Error) {
    super({
      originalError: error,
      errmsg:
        'sorry our server encountered some problem and cannot procces your request',
      status: 500,
    });
  }
}
