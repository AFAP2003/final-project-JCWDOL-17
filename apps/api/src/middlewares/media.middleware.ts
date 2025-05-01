import { BadRequestError, InternalSeverError } from '@/errors';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});

export const withImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const uploadmd = upload.fields([{ name: 'image', maxCount: 1 }]);
  uploadmd(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      next(new BadRequestError(err.message));
    } else if (err) {
      next(new InternalSeverError(err));
    }

    // everything goes fine
    next();
  });
};
