import inventoryManagementService from '@/services/inventoryManagement.service';
import { NextFunction, Request, Response } from 'express';

class InventoryManagementController {
  async getInventories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const { total, data } =
        await inventoryManagementService.listAllInventories(page, take);

      res.status(200).send({
        success: true,
        message: 'Inventories fetched successfully',
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

  async createInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await inventoryManagementService.createNewInventory(
        req.body,
      );
      res.status(200).send({
        success: true,
        message: 'Inventory created successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { productId, storeId, minStock } = req.body;
      const addQuantity = Number(req.body.addQuantity) || 0;
      const subtractQuantity = Number(req.body.subtractQuantity) || 0;
      const data = await inventoryManagementService.updateInventoryById(
        id,
        { productId, storeId, minStock },
        addQuantity,
        subtractQuantity,
      );

      res.status(200).send({
        success: true,
        message: 'Inventory updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await inventoryManagementService.deleteInventoryById(id);

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

export default new InventoryManagementController();
