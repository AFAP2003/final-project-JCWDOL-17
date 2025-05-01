import { Category } from '@/interfaces/categoryManagement.interface';
import { prismaclient } from '@/prisma';
import categoryManagementRepository from '@/repositories/categoryManagement.repository';

class CategoryManagementService{
    async listAllCategories(page =1,take=10){
        return await categoryManagementRepository.getCategories(page,take)
    }
    
    async createNewCategory(categoryData:Category){

        return await categoryManagementRepository.createCategory(categoryData)

    }

    async updateCategoryById(id:string,categoryData:Category){
        return await categoryManagementRepository.updateCategory(id,categoryData)
    }

    async deleteCategoryById(id:string){
        return await categoryManagementRepository.deleteCategory(id)
    }
}

export default new CategoryManagementService()