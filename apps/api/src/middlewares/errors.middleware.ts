import { ApiError } from '@/errors';
// import { APIError } from 'better-auth/api';
import { NextFunction, Request, Response } from 'express';

function logerror(err: Error) {
  console.error('Error Msg   : ', err.message);
  console.error('Error Stack : ', err.stack);
}

// Middleware for handling 404 Not Found
export const withNotFound = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({
    error: {
      message: 'The resource you are looking for cannot be found.',
    },
  });
};
// Middleware for handling errors
export const withError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Prevent duplicate responses
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    if (err.status === 500) logerror(err);
    return res.status(err.status).json({
      error: {
        message: err.errmsg,
        detail: err.errdetail,
      },
    });
  }

  // Handle unknown errors
  logerror(err);
  return res.status(500).json({
    error: {
      message:
        'Sorry, the server encountered a problem and cannot process your request.',
    },
  });
};
