import { ApiError } from './types';

export class UnprocessableEntityError extends ApiError {
  constructor(errdetail: Record<string, any> | any) {
    super({
      errmsg: 'we found some issue with your request',
      errdetail,
      status: 422,
    });
  }
}
