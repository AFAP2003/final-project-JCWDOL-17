import { Product } from '@/interfaces/productManagement.interface';
import { prismaclient } from '@/prisma';
import productManagementRepository from '@/repositories/productManagement.repository';

class ProductManagementService{
    async listAllProducts(){
        return await productManagementRepository.getProducts()
    }
    
    async getProductDetail(id:string){
        return await productManagementRepository.getProductById(id)
    }

    async createNewProduct(productData:Product){
        return await productManagementRepository.createProduct(productData)

    }

    async updateProductById(id:string,categoryData:Product){
        return await productManagementRepository.updateProduct(id,categoryData)
    }

    async deleteProductById(id:string){
        return await productManagementRepository.deleteProduct(id)
    }
}

export default new ProductManagementService()