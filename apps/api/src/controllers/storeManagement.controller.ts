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
}

export default new StoreManagementController();
