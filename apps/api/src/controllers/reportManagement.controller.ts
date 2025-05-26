import { getSession } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import reportManagementService from '@/services/reportManagement.service';
import { NextFunction, Request, Response } from 'express';

class ReportManagementController {
  async getMonthlySales(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = getSession(req);
      let effectiveStoreId: string | 'all';
      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });
        if (!store) {
          throw new Error(`No store found for admin ${user.id}`);
        }
        effectiveStoreId = store.id;
      } else if (user.role === 'SUPER') {
        // For SUPER admin, use the storeId from query, or default to 'all'
        effectiveStoreId = (req.query.storeId as string) || 'all';
      } else {
        // For any other roles, you might want to deny access or default to 'all'
        // For safety, let's deny or make it very specific if other roles exist
        return res
          .status(403)
          .send({
            success: false,
            message: 'Unauthorized role for stock report',
          });
        // Or if they should see all by default: effectiveStoreId = 'all';
      }
      const year = parseInt(req.query.year as string, 10);
      const data = await reportManagementService.fetchAllMonthlySales(
        year,
        effectiveStoreId,
      );
      res.status(200).send({
        success: true,
        message: 'Monthly Sales for All Products Fetched Successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategorySales(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = getSession(req);
      let effectiveStoreId: string | 'all';
      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });
        if (!store) {
          throw new Error(`No store found for admin ${user.id}`);
        }
        effectiveStoreId = store.id;
      } else if (user.role === 'SUPER') {
        // For SUPER admin, use the storeId from query, or default to 'all'
        effectiveStoreId = (req.query.storeId as string) || 'all';
      } else {
        // For any other roles, you might want to deny access or default to 'all'
        // For safety, let's deny or make it very specific if other roles exist
        return res
          .status(403)
          .send({
            success: false,
            message: 'Unauthorized role for stock report',
          });
        // Or if they should see all by default: effectiveStoreId = 'all';
      }
      const year = parseInt(req.query.year as string, 10);
      const month = parseInt(req.query.month as string, 10);
      const storeId = (req.query.storeId as string) || 'all';

      const data = await reportManagementService.fetchCategorySales(
        year,
        month,
        storeId,
      );
      res.status(200).send({
        success: true,
        message: 'Monthly Sales for Each Category Fetched Successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductSales(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = getSession(req);
      let effectiveStoreId: string | 'all';
      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });
        if (!store) {
          throw new Error(`No store found for admin ${user.id}`);
        }
        effectiveStoreId = store.id;
      } else if (user.role === 'SUPER') {
        // For SUPER admin, use the storeId from query, or default to 'all'
        effectiveStoreId = (req.query.storeId as string) || 'all';
      } else {
        // For any other roles, you might want to deny access or default to 'all'
        // For safety, let's deny or make it very specific if other roles exist
        return res
          .status(403)
          .send({
            success: false,
            message: 'Unauthorized role for stock report',
          });
        // Or if they should see all by default: effectiveStoreId = 'all';
      }
      const year = parseInt(req.query.year as string, 10);
      const month = parseInt(req.query.month as string, 10);
      const storeId = (req.query.storeId as string) || 'all';

      const data = await reportManagementService.fetchProductSales(
        year,
        month,
        storeId,
      );

      res.status(200).send({
        success: true,
        message: 'Monthly Sales for Each Products Fetched Successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = getSession(req);
      let effectiveStoreId: string | 'all';

      // Determine effectiveStoreId based on role
      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });
        if (!store) {
          throw new Error(`No store found for admin ${user.id}`);
        }
        effectiveStoreId = store.id;
      } else if (user.role === 'SUPER') {
        // For SUPER admin, use the storeId from query, or default to 'all'
        effectiveStoreId = (req.query.storeId as string) || 'all';
      } else {
        // For any other roles, you might want to deny access or default to 'all'
        // For safety, let's deny or make it very specific if other roles exist
        return res
          .status(403)
          .send({
            success: false,
            message: 'Unauthorized role for stock report',
          });
        // Or if they should see all by default: effectiveStoreId = 'all';
      }

      const year = parseInt(req.query.year as string, 10);
      const month = parseInt(req.query.month as string, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;

      if (isNaN(year) || isNaN(month)) {
        return res
          .status(400)
          .send({
            success: false,
            message: 'Invalid year or month parameters',
          });
      }

      const { total, data } = await reportManagementService.fetchStockReport(
        page,
        take,
        year,
        month,
        effectiveStoreId,
      );
      res.status(200).send({
        success: true,
        message: 'Stock Report Fetched Successfully',
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
}

export default new ReportManagementController();
