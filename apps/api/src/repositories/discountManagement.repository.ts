import { Discount } from '@/interfaces/discountManagement.interface';
import { prismaclient } from '@/prisma';
class DiscountManagementRepository {
    async getDiscounts(){
        return await prismaclient.discount.findMany()
    }
    
    async createDiscount(discountData:Discount){
        return await prismaclient.discount.create({
            data:discountData
        })
    }

    async updateDiscount(id:string,discountData:Discount){
        return await prismaclient.discount.update({
            where:{
                id
            },
            data:{
                ...discountData
            }
        })
    }

    async deleteDiscount(id:string){
        return await prismaclient.discount.delete({
            where:{
                id
            }
        })
    }

}

export default new DiscountManagementRepository()