import { Product } from '@/interfaces/productManagement.interface';
import { prismaclient } from '@/prisma';

class ProductManagementRepository {
    async getProducts(){
        return await prismaclient.product.findMany()
    }
    
    async getProductById(id:string){
        return await prismaclient.product.findUnique({
            where:{
                id
            }
        })
    }

    async createProduct(productData:Product){
        return await prismaclient.product.create({
            data:productData
        })
    }

    async updateProduct(id:string,productData:Product){
        return await prismaclient.product.update({
            where:{
                id
            },
            data:{
                ...productData
            }
        })
    }

    async deleteProduct(id:string){
        return await prismaclient.product.delete({
            where:{
                id
            }
        })
    }

}

export default new ProductManagementRepository()