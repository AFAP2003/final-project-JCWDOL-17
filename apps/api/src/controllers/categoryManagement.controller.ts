import categoryManagementService from '@/services/categoryManagement.service';
import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

class CategoryManagementController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const search = (req.query.search as string) ?? '';
      const { total, data } = await categoryManagementService.listAllCategories(
        page,
        take,
        search,
      );

      res.status(200).send({
        success: true,
        message: 'Categories fetched successfully',
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

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await categoryManagementService.createNewCategory(req.body);

      res.status(200).send({
        success: true,
        message: 'Category created successfully',
        data,
      });
    } catch (error: any) {
      if (error.name === 'DuplicateNameError') {
        res.status(400).send({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await categoryManagementService.updateCategoryById(
        id,
        req.body,
      );

      res.status(200).send({
        success: true,
        message: 'Category updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await categoryManagementService.deleteCategoryById(id);

      res.status(200).send({
        success: true,
        message: 'Category deleted successfully',
        data,
      });
    } catch (error) {
      // foreign-key violation: some Product rows still reference this category
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        return res.status(409).send({
          success: false,
          message:
            'Cannot delete category: there are products tied to it. Remove those first.',
        });
      }
      next(error);
    }
  }
}

export default new CategoryManagementController();
