import userManagementService from '@/services/userManagement.service'
import { Request, Response, NextFunction } from 'express'

class UserManagementController{
    async getUsers(req:Request,res:Response,next:NextFunction){
        try {
            const data = await userManagementService.listAllUsers()
            res.status(200).send({
                success:true,
                message:"Users fetched successfully",
                data
            })

            
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
        } catch (error) {
            next(error)
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