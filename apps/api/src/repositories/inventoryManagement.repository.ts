import { prismaclient } from '@/prisma';
import { Inventory } from '@/interfaces/inventoryManagement.interface';
import { pagination } from '@/helpers/pagination';
class InventoryManagementRepository {
    async getInventories(page=1,take=10){
        const total = await prismaclient.inventory.count()

        const {skip,take:realTake} =  pagination(page,take)
        const data = await prismaclient.inventory.findMany({
            include: {
                product: {
                  include: {
                    category: true,
                  },
                },
                store: true,
              },
              skip,
              take:realTake
        })

        return {total,data}
    }
    
    async createInventory(inventoryData:Inventory){
        return await prismaclient.inventory.create({
            data:inventoryData
        })
    }

    async updateInventory(id:string,inventoryData:Inventory){
        return await prismaclient.inventory.update({
            where:{
                id
            },
            data:{
                ...inventoryData
            }
        })
    }

    async deleteInventory(id:string){
        return await prismaclient.inventory.delete({
            where:{
                id
            }
        })
    }

}

export default new InventoryManagementRepository()