import { Category } from '@/interfaces/categoryManagement.interface';
import { prismaclient } from '@/prisma';
import categoryManagementRepository from '@/repositories/categoryManagement.repository';

class CategoryManagementService{
    async listAllCategories(){
        return await categoryManagementRepository.getCategories()
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