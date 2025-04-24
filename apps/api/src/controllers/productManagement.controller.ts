import productManagementService from '@/services/productManagement.service'
import { Request, Response, NextFunction } from 'express'

class ProductManagementController{
    async getProducts(req:Request,res:Response,next:NextFunction){
        try {
            const data = await productManagementService.listAllProducts()

            res.status(200).send({
                success:true,
                message:"Products fetched successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async getProductById(req:Request,res:Response,next:NextFunction){
        try {
            const {id} = req.params
            const data = await productManagementService.getProductDetail(id)
            res.status(200).send({
                success:true,
                message: 'Product Detail Fetched Successfully',
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async createProduct(req:Request,res:Response,next:NextFunction){
        try {

            const data = await productManagementService.createNewProduct(req.body)
            res.status(200).send({
                success:true,
                message:"Product created successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async updateProduct(req:Request,res:Response,next:NextFunction){
        try {
            const {id} = req.params
            const data = await productManagementService.updateProductById(id,req.body)

            res.status(200).send({
                success:true,
                message:"Product updated successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteProduct(req:Request,res:Response,next:NextFunction){
       try {
        const {id} = req.params
        const data = await productManagementService.deleteProductById(id)

        res.status(200).send({
            success:true,
            message:"Product deleted successfully",
            data
        })
       } catch (error) {
            next(error)
       }
    }
}

export default new ProductManagementController()