import { getSession } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import inventoryManagementService from '@/services/inventoryManagement.service';
import { NextFunction, Request, Response } from 'express';

class InventoryManagementController {
  async getInventories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const take = parseInt(req.query.take as string, 10) || 10;
      const search = (req.query.search as string) ?? '';
      const storeId = (req.query.storeId as string) ?? '';
      const categoryId = (req.query.categoryId as string) ?? '';
      const status = (req.query.status as string) ?? '';
      const { user } = getSession(req);
      console.log('the result of session user: ', user);
      let adminStoreId: string | undefined;

      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });

        if (!store) {
          return res.status(404).send({
            success: false,
            message: 'Store not found for this admin',
          });
        }

        adminStoreId = store.id;
      }

      const { total, data } =
        await inventoryManagementService.listAllInventories(
          page,
          take,
          adminStoreId,
          search,
          storeId,
          categoryId,
          status,
        );

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
      const { user } = getSession(req);

      // For ADMIN users, we'll override storeId with their assigned store
      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });

        if (!store) {
          return res.status(404).send({
            success: false,
            message: 'Store not found for this admin',
          });
        }

        // Override storeId with admin's store
        req.body.storeId = store.id;
      }

      // For SUPER users, use the provided storeId
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
      const { minStock } = req.body;
      const addQuantity = Number(req.body.addQuantity) || 0;
      const subtractQuantity = Number(req.body.subtractQuantity) || 0;

      // Get current inventory to check permissions
      const currentInventory = await prismaclient.inventory.findUnique({
        where: { id },
        include: { store: true },
      });

      if (!currentInventory) {
        return res.status(404).send({
          success: false,
          message: 'Inventory not found',
        });
      }

      // Get user session
      const { user } = getSession(req);

      // For ADMIN users, verify they're updating their own store's inventory
      if (user.role === 'ADMIN') {
        const store = await prismaclient.store.findUnique({
          where: { adminId: user.id },
        });

        if (!store || store.id !== currentInventory.storeId) {
          return res.status(403).send({
            success: false,
            message: 'Not authorized to update this inventory',
          });
        }
      }

      // Update the inventory
      const data = await inventoryManagementService.updateInventoryById(
        id,
        { minStock } as any,
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
