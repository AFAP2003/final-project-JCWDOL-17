import { getImageFromRequest } from '@/helpers/get-image-from-request';
import { MediaService } from '@/services/media.service';
import userManagementService from '@/services/userManagement.service';
import { NextFunction, Request, Response } from 'express';

class UserManagementController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const { total, data } = await userManagementService.listAllUsers(
        page,
        take,
      );
      res.status(200).send({
        success: true,
        message: 'Users fetched successfully',
        data,
        pagination: {
          currentPage: page,
          pageSize: take,
          totalItems: total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await userManagementService.listUserById(id);

      res.status(200).send({
        success: true,
        message: 'User by Id Fetched Successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    const mediaService = new MediaService();

    try {
      // 1) extract the uploaded file buffer
      const file = getImageFromRequest(req);

      // 2) send it to Cloudinary, get back a URL
      const imageUrl = await mediaService.uploadImage({ file: file.buffer });

      const payload = { ...req.body, image: imageUrl };
      const data = await userManagementService.createNewUser(payload);
      res.status(200).send({
        success: true,
        message: 'User Created Successfully',
        data,
      });
    } catch (error: any) {
      if (error.name == 'DuplicateEmailError') {
        res.status(400).send({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaService = new MediaService();

      const { id } = req.params;

      const existing = await userManagementService.listUserById(id);
      if (!existing) {
        return res.status(404).send({
          success: false,
          message: 'Existing User Image Not Found',
        });
      }
      let imageUrl = existing.image;

      if (req.file) {
        if (imageUrl?.startsWith('https://res.cloudinary.com')) {
          console.log('File for removal: ', imageUrl);
          await mediaService.removeImage(imageUrl);
        }
        imageUrl = await mediaService.uploadImage({ file: req.file.buffer });
      }
      const data = await userManagementService.updateUserById(id, {
        ...req.body,
        image: imageUrl,
      });

      res.status(200).send({
        success: true,
        message: 'User updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaService = new MediaService();
      const { id } = req.params;

      const user = await userManagementService.listUserById(id);

      if (user?.image?.startsWith('https://res.cloudinary.com')) {
        const result = await mediaService.removeImage(user.image);
      }

      const data = await userManagementService.deleteUserById(id);

      res.status(200).send({
        success: true,
        message: 'User deleted successfully',
        data,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      next(error);
    }
  }
}

export default new UserManagementController();
