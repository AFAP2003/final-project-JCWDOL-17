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

    // 1) fetch the existing record
    const existing = await userManagementService.listUserById(id);
    if (!existing) {
      return res.status(404).send({
        success: false,
        message: 'Existing User Not Found',
      });
    }

    // 2) see if we got an uploaded file
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file = files?.image?.[0];

    // 3) if there's a file, remove the old one and upload new
    let newImageUrl: string | undefined;
    if (file) {
      if (existing.image?.startsWith('https://res.cloudinary.com')) {
        await mediaService.removeImage(existing.image);
      }
      newImageUrl = await mediaService.uploadImage({ file: file.buffer });
    }

    // 4) build your payload — spread in req.body, then only add `image` if we got one
    const updatePayload: any = { ...req.body };
    if (newImageUrl) {
      updatePayload.image = newImageUrl;
    }

    // 5) call your service/repo
    const data = await userManagementService.updateUserById(id, updatePayload);

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
