import { cloudinaryclient } from '@/cloudinary';
import { cloudinaryPublicIdFromURL } from '@/helpers/cloudinary-public-id-from-url';
import { UploadApiOptions } from 'cloudinary';
import { Readable } from 'stream';

export class MediaService {
  uploadImage = async (param: {
    file: Buffer;
    options?: UploadApiOptions;
  }): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryclient.uploader.upload_stream(
        {
          ...param.options,
          folder: 'finpro-go-grocery',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result!.secure_url);
        },
      );

      // Convert the buffer to a readable stream and pipe it to the upload stream
      const readableStream = new Readable();
      readableStream.push(param.file);
      readableStream.push(null); // Signal end of stream
      readableStream.pipe(uploadStream);
    });
  };

  removeImage = async (url: string) => {
    const publicId = cloudinaryPublicIdFromURL(url);
    if (!publicId) return null;
    return await cloudinaryclient.uploader.destroy(publicId);
  };
}
