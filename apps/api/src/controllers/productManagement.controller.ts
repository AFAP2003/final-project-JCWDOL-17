import { getSession } from '@/helpers/session-helper';
import { MediaService } from '@/services/media.service';
import productManagementService from '@/services/productManagement.service';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

class ProductManagementController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const search = (req.query.search as string) ?? '';
      const categoryId = (req.query.categoryId as string) ?? '';
      const status = (req.query.status as string) ?? '';
      const { user } = getSession(req);
      const adminId = user.role === 'ADMIN' ? user.id : undefined;

      const { total, data } = await productManagementService.listAllProducts(
        page,
        take,
        adminId,
        search,
        categoryId,
        status,
      );

      res.status(200).send({
        success: true,
        message: 'Products fetched successfully',
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

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await productManagementService.getProductDetail(id);
      res.status(200).send({
        success: true,
        message: 'Product Detail Fetched Successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaService = new MediaService();

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        throw new Error('No images uploaded');
      }

      let urls: string[] = [];
      try {
        urls = await mediaService.uploadImages({
          files: files.map((f) => f.buffer),
        });
      } catch (uploadErr) {
        console.error('Image Upload Error:', uploadErr);
      }

      const payload = { ...req.body, images: urls };

      const data = await productManagementService.createNewProduct(payload);

      res.status(200).send({
        success: true,
        message: 'Product created successfully',
        data,
      });
    } catch (error: any) {
      console.error('Create Product Error:', error);

      if (error.name === 'DuplicateProductError') {
        res.status(400).send({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).send({
          success: false,
          message: error.message || 'Failed to create product',
        });
      }
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mediaService = new MediaService();

      const existing = await productManagementService.getProductDetail(id);

      if (!existing) {
        return res.status(404).send({
          success: false,
          message: 'Existing Product Not Found',
        });
      }

      const existingImages = existing.images.map((image) => image.imageUrl);

      const keptImages: string[] =
        req.body.keptImages instanceof Array
          ? req.body.keptImages
          : req.body.keptImages
            ? [req.body.keptImages]
            : [];

      const toRemove = existingImages.filter(
        (url) => !keptImages.includes(url),
      );

      for (const remove of toRemove) {
        if (remove.startsWith('https://res.cloudinary.com')) {
          await mediaService.removeImage(remove);
        }
      }
      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedUrls =
        files.length > 0
          ? await mediaService.uploadImages({
              files: files.map((f) => f.buffer),
            })
          : [];

      const mainImageIndex = parseInt(req.body.mainIndex, 10) || 0;
      const payload = {
        ...req.body,
        newImages: uploadedUrls,
        keptImages,
        mainImageIndex,
      };

      const data = await productManagementService.updateProductById(
        id,
        payload,
      );

      res.status(200).send({
        success: true,
        message: 'Product updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const mediaService = new MediaService();

      const { id } = req.params;
      const product = await productManagementService.getProductDetail(id);
      if (!product) {
        return res.status(400).send({
          success: false,
          message: 'Product not found',
        });
      }
      const getAll = product.images.map((product) => product.imageUrl);
      for (const url of getAll) {
        if (url.startsWith('https://res.cloudinary.com')) {
          await mediaService.removeImage(url);
        }
      }

      const data = await productManagementService.deleteProductById(id);
      res.status(200).send({
        success: true,
        message: 'Product deleted successfully',
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        return res.status(409).send({
          success: false,
          message:
            'Cannot delete product: there are inventory records tied to it. Remove inventory entries first.',
        });
      }
      next(error);
    }
  }
}

export default new ProductManagementController();
