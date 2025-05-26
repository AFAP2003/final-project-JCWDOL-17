import { Inventory } from '@/interfaces/inventoryManagement.interface';
import inventoryManagementRepository from '@/repositories/inventoryManagement.repository';

class InventoryManagementService {
  async listAllInventories(
    page = 1,
    take = 10,
    adminId?: string,
    search = '',
    storeId = '',
    categoryId = '',
    status = '',
  ) {
    return await inventoryManagementRepository.getInventories(
      page,
      take,
      adminId,
      search,
      storeId,
      categoryId,
      status,
    );
  }

  async createNewInventory(inventoryData: Inventory) {
    return await inventoryManagementRepository.createInventory(inventoryData);
  }
  async updateInventoryById(
    id: string,
    inventoryData: Inventory,
    addQuantity = 0,
    subtractQuantity = 0,
  ) {
    return await inventoryManagementRepository.updateInventory(
      id,
      inventoryData,
      addQuantity,
      subtractQuantity,
    );
  }

  async deleteInventoryById(id: string) {
    return await inventoryManagementRepository.deleteInventory(id);
  }
}

export default new InventoryManagementService();
