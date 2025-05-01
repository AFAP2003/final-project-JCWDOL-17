import { Discount } from '@/interfaces/discountManagement.interface';
import { Inventory } from '@/interfaces/inventoryManagement.interface';
import { prismaclient } from '@/prisma';
import discountManagementRepository from '@/repositories/discountManagement.repository';
import inventoryManagementRepository from '@/repositories/inventoryManagement.repository';

class DiscountManagementService{
    async listAllDiscounts(){
        return await discountManagementRepository.getDiscounts()
    }
    
    async createNewDiscount(discountData:Discount){
        return await discountManagementRepository.createDiscount(discountData)

    }

    async updateDiscountById(id:string,discountData:Discount){
        return await discountManagementRepository.updateDiscount(id,discountData)
    }

    async deleteDiscountById(id:string){
        return await discountManagementRepository.deleteDiscount(id)
    }
}

export default new DiscountManagementService()