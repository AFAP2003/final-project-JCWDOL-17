import categoryManagementService from '@/services/categoryManagement.service'
import { Request, Response, NextFunction } from 'express'

class CategoryManagementController{
    async getCategories(req:Request,res:Response,next:NextFunction){
        try {
            const page = parseInt(req.query.page as string, 10) || 1;
            const take = parseInt(req.query.take as string, 10) || 10;
            const {total,data} = await categoryManagementService.listAllCategories(page,take)

            res.status(200).send({
                success:true,
                message:"Categories fetched successfully",
                data,
                pagination:{
                    currentPage:page,
                    pageSize:take,
                    totalItems:total,
                    totalPages:Math.ceil(total/take)

                }
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
        } catch (error:any) {
            if(error.name === 'DuplicateNameError'){
                res.status(400).send({
                    success:false,
                    message:error.message
                })
            }
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