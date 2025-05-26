import { getSession } from '@/helpers/session-helper';
import discountManagementService from '@/services/discountManagement.service';
import { NextFunction, Request, Response } from 'express';

class DiscountManagementController {
  async getDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const search = (req.query.search as string) ?? '';
      const type = (req.query.type as string) ?? '';
      const valueType = (req.query.valueType as string) ?? '';
      const status = (req.query.status as string) ?? '';
      const { user } = getSession(req);
      const adminId = user.role === 'ADMIN' ? user.id : undefined;
      const { total, data } = await discountManagementService.listAllDiscounts(
        page,
        take,
        adminId,
        search,
        type,
        valueType,
        status,
      );

      res.status(200).send({
        success: true,
        message: 'Discounts fetched successfully',
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

  async createDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = getSession(req);
      const adminId = user.role === 'ADMIN' ? user.id : undefined;
      const data = await discountManagementService.createNewDiscount(
        req.body,
        adminId,
      );
      res.status(200).send({
        success: true,
        message: 'Discount created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await discountManagementService.updateDiscountById(
        id,
        req.body,
      );

      res.status(200).send({
        success: true,
        message: 'Discount updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await discountManagementService.deleteDiscountById(id);

      res.status(200).send({
        success: true,
        message: 'Inventory deleted successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DiscountManagementController();
