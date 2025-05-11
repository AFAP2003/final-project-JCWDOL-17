import { BadRequestError, InternalSeverError } from '@/errors';
import { Request } from 'express';

// Get singgle image from request
export function getImageFromRequest(req: Request) {
  if (!req.files) {
    throw new BadRequestError('Missing required file body with key: "image"');
  }
  if (Array.isArray(req.files)) {
    throw new InternalSeverError(
      'Multer middleware should not take an array. Check your multer middleware rules.',
    );
  }

  const imageFiles = req.files['image'];
  if (!imageFiles || imageFiles.length === 0) {
    throw new BadRequestError('No image file uploaded under key: "image"');
  }

  return imageFiles[0];
}
