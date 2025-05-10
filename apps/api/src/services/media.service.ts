import { cloudinaryclient } from '@/cloudinary';
import { cloudinaryPublicIdFromURL } from '@/helpers/cloudinary-public-id-from-url';
import { UploadApiOptions } from 'cloudinary';
import { unescape } from 'querystring';
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
    const result = cloudinaryclient.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);

    return result    

  };
  
  uploadImages = async (params: {
    files: Buffer[];
    options?: UploadApiOptions;
  }): Promise<string[]> => {
    const results: string[] = [];

    for (const file of params.files) {
      const url = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinaryclient.uploader.upload_stream(
          {
            ...params.options,
            folder: 'finpro-go-grocery',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result?.secure_url) return reject(new Error('No URL returned'));
            resolve(result.secure_url);
          },
        );

        const readableStream = new Readable();
        readableStream.push(file);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });

      results.push(url)
    }
    return results
  }
}
