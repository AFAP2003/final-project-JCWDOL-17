import { Inventory } from '@/interfaces/inventoryManagement.interface';
import { prismaclient } from '@/prisma';
import categoryManagementRepository from '@/repositories/categoryManagement.repository';
import inventoryManagementRepository from '@/repositories/inventoryManagement.repository';

class InventoryManagementService{
    async listAllInventories(page=1,take=10){
        return await inventoryManagementRepository.getInventories(page,take)
    }
    
    async createNewInventory(inventoryData:Inventory){
        return await inventoryManagementRepository.createInventory(inventoryData)

    }

    async updateInventoryById(id:string,inventoryData:Inventory){
        return await inventoryManagementRepository.updateInventory(id,inventoryData)
    }

    async deleteInventoryById(id:string){
        return await inventoryManagementRepository.deleteInventory(id)
    }
}

export default new InventoryManagementService()