import userManagementService from '@/services/userManagement.service'
import { Request, Response, NextFunction } from 'express'

class UserManagementController{
    async getUsers(req:Request,res:Response,next:NextFunction){
        try {
             const page = parseInt(req.query.page as string, 10) || 1;
            const take = parseInt(req.query.take as string, 10) || 10;
            const {total,data} = await userManagementService.listAllUsers(page,take)
            res.status(200).send({
                success:true,
                message:"Users fetched successfully",
                data,
                pagination:{
                    currentPage:page,
                    pageSize:take,
                    totalItems:total,
                    totalPages:Math.ceil(total/take)

                }            })

            
        } catch (error) {
            next(error)
        }
    }

    async createUser(req:Request,res:Response,next:NextFunction){

        try {

            const data = await userManagementService.createNewUser(req.body)
            res.status(200).send({
                success:true,
                message:'User Created Successfully',
                data
            })
        } catch (error:any) {
            if (error.name == 'DuplicateEmailError') {
                res.status(400).send({
                    success:false,
                    message:error.message
                    
                })
            } else {
                next(error)

            }
        }
    
    }

    async updateUser(req:Request,res:Response,next:NextFunction){
        try {
            const {id} = req.params
            const data = await userManagementService.updateUserById(id,req.body)

            res.status(200).send({
                success:true,
                message:"User updated successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async deleteUser(req:Request,res:Response,next:NextFunction){
        try {
            const {id} = req.params
            const data = await userManagementService.deleteUserById(id)

            res.status(200).send({
                success:true,
                message:"User deleted successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new UserManagementController()