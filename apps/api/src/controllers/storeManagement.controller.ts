import { getSession } from '@/helpers/session-helper';
import storeManagementService from '@/services/storeManagement.service';
import { NextFunction, Request, Response } from 'express';

class StoreManagementController {
  async getStores(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await storeManagementService.listAllStores();
      res.status(200).send({
        success: true,
        message: 'Stores fetched successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoreByAdminId(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = getSession(req);

      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only ADMIN can access this endpoint',
        });
      }

      const store = await storeManagementService.listStoreById(user.id);

      return res.status(200).json({
        success: true,
        data: store,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

export default new StoreManagementController();
