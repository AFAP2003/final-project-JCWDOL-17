import { BadRequestError, InternalSeverError } from '@/errors';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadFile = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only .jpg, .jpeg and .png files are allowed'));
    }
  },
});

export const withFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const uploadMiddleware = uploadFile.single('file');

  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('File size must be less than 1MB'));
      }
      return next(new BadRequestError(err.message));
    } else if (err) {
      return next(new InternalSeverError(err));
    }

    next();
  });
};
