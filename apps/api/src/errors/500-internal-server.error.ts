import { ApiError } from './types';

export class InternalSeverError extends ApiError {
  constructor(error: Error | string) {
    if (typeof error === 'string') {
      error = new Error(error);
    }

    super({
      originalError: error,
      errmsg:
        'sorry our server encountered some problem and cannot procces your request',
      status: 500,
    });
  }
}
