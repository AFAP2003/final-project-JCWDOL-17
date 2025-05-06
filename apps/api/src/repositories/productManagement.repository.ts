import { pagination } from '@/helpers/pagination';
import { Product } from '@/interfaces/productManagement.interface';
import { prismaclient } from '@/prisma';

class ProductManagementRepository {
    async getProducts(page=1,take=10){

        const total = await prismaclient.product.count()
        const {skip,take:realTake} = pagination(page,take)
        const data = await prismaclient.product.findMany({
            include:{
                inventory:true,
                category:true
            },
            skip,
            take:realTake
        })

        return{total,data}

    }
    
    async getProductById(id:string){
        return await prismaclient.product.findUnique({
            where:{
                id
            }
        })
    }

    async createProduct(productData:Product){
        const existingProduct = await prismaclient.product.findUnique({
            where:{
                name:productData.name
            }
        })

        if(existingProduct){
            const error = new Error('Product already exist')
            error.name = 'DuplicateProductError'
            throw error
        }
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