import { Category } from '@/interfaces/categoryManagement.interface';
import { prismaclient } from '@/prisma';

class CategoryManagementRepository {
    async getCategories(){
        return await prismaclient.category.findMany()
    }
    
    async createCategory(categoryData:Category){
        return await prismaclient.category.create({
            data:categoryData
        })
    }

    async updateCategory(id:string,categoryData:Category){
        return await prismaclient.category.update({
            where:{
                id
            },
            data:{
                ...categoryData
            }
        })
    }

    async deleteCategory(id:string){
        return await prismaclient.category.delete({
            where:{
                id
            }
        })
    }

}

export default new CategoryManagementRepository()