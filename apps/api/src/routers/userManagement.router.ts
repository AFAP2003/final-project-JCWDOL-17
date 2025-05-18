import userManagementController from "@/controllers/userManagement.controller";
import { withImageUpload, withImageUploadEdit } from "@/middlewares/media.middleware";
import { Router } from "express";

export const userManagementRouter = ()=>{
    const router = Router()

    router.get('/users',userManagementController.getUsers)
      router.get('/users/:id', userManagementController.getUserById);
    router.post('/users',withImageUpload,userManagementController.createUser)
    router.put('/users/:id',withImageUploadEdit,userManagementController.updateUser)
    router.delete('/users/:id',userManagementController.deleteUser)
    return router
}