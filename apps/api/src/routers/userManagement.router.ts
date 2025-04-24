import userManagementController from "@/controllers/userManagement.controller";
import { Router } from "express";

export const userManagementRouter = ()=>{
    const router = Router()

    router.get('/users',userManagementController.getUsers)
    router.post('/users',userManagementController.createUser)
    router.put('/users/:id',userManagementController.updateUser)
    router.delete('/users/:id',userManagementController.deleteUser)
    return router
}