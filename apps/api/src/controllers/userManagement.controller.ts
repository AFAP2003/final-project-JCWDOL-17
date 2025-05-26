import { getImageFromRequest } from '@/helpers/get-image-from-request';
import { MediaService } from '@/services/media.service';
import userManagementService from '@/services/userManagement.service';
import { NextFunction, Request, Response } from 'express';

class UserManagementController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const search = (req.query.search as string) ?? '';
      const role = (req.query.role as string) ?? '';
      const verified = (req.query.verified as string) ?? '';
      const { total, data } = await userManagementService.listAllUsers(
        page,
        take,
        search,
        role,
        verified,
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
      const file = getImageFromRequest(req);

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
          message: 'Existing User Not Found',
        });
      }

      const files = req.files as
        | Record<string, Express.Multer.File[]>
        | undefined;
      const file = files?.image?.[0];

      let newImageUrl: string | undefined;
      if (file) {
        if (existing.image?.startsWith('https://res.cloudinary.com')) {
          await mediaService.removeImage(existing.image);
        }
        newImageUrl = await mediaService.uploadImage({ file: file.buffer });
      }

      const updatePayload: any = { ...req.body };
      if (newImageUrl) {
        updatePayload.image = newImageUrl;
      }

      const data = await userManagementService.updateUserById(
        id,
        updatePayload,
      );

      return res.status(200).send({
        success: true,
        message: 'User updated successfully',
        data,
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
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
