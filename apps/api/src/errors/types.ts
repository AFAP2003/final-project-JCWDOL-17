type ConstructorParam = {
  status: number;
  errmsg: string;
  errdetail?: Record<any, any>;
  originalError?: Error;
};

export abstract class ApiError extends Error {
  readonly status: number;
  readonly errmsg: string;
  readonly errdetail?: Record<string, string>; // for 403 error
  readonly _errinternal?: string; // for server error, will be logged

  constructor({ status, errmsg, errdetail, originalError }: ConstructorParam) {
    super(originalError?.message || errmsg);
    this.errmsg = errmsg;
    this.status = status;
    this.errdetail = errdetail;
    this._errinternal = originalError?.message;
    Error.captureStackTrace(this, this.constructor);
  }
}
