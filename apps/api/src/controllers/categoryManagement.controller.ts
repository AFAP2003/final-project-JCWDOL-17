import categoryManagementService from '@/services/categoryManagement.service'
import { Request, Response, NextFunction } from 'express'

class CategoryManagementController{
    async getCategories(req:Request,res:Response,next:NextFunction){
        try {
            const data = await categoryManagementService.listAllCategories()

            res.status(200).send({
                success:true,
                message:"Categories fetched successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async createCategory(req:Request,res:Response,next:NextFunction){
        try {

            const data = await categoryManagementService.createNewCategory(req.body)
            res.status(200).send({
                success:true,
                message:"Category created successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async updateCategory(req:Request,res:Response,next:NextFunction){
        try {
            const {id} = req.params
            const data = await categoryManagementService.updateCategoryById(id,req.body)

            res.status(200).send({
                success:true,
                message:"Category updated successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteCategory(req:Request,res:Response,next:NextFunction){
       try {
        const {id} = req.params
        const data = await categoryManagementService.deleteCategoryById(id)

        res.status(200).send({
            success:true,
            message:"Category deleted successfully",
            data
        })
       } catch (error) {
            next(error)
       }
    }
}

export default new CategoryManagementController()