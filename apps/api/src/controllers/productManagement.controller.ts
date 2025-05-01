import productManagementService from '@/services/productManagement.service';
import { Request, Response, NextFunction } from 'express';
import { resolveContent } from 'nodemailer/lib/shared';

class ProductManagementController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const { total, data } = await productManagementService.listAllProducts(
        page,
        take,
      );

      res.status(200).send({
        success: true,
        message: 'Products fetched successfully',
        data,
        pagination:{
            currentPage:page,
            pageSize:take,
            totalItems:total,
            totalPages:Math.ceil(total/take)

        }   
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
      const data = await productManagementService.createNewProduct(req.body);
      res.status(200).send({
        success: true,
        message: 'Product created successfully',
        data,
      });
    } catch (error: any) {
      if (error.name === 'DuplicateProductError') {
        res.status(400).send({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await productManagementService.updateProductById(
        id,
        req.body,
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
      const { id } = req.params;
      const data = await productManagementService.deleteProductById(id);

      res.status(200).send({
        success: true,
        message: 'Product deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductManagementController();
