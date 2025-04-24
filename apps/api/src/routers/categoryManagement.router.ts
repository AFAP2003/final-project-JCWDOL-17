import categoryManagementController from "@/controllers/categoryManagement.controller";
import { Router } from "express";

export const categoryManagementRouter =()=>{
    const router = Router()

    router.get('/categories',categoryManagementController.getCategories)
    router.post('/categories',categoryManagementController.createCategory)
    router.put('/categories/:id',categoryManagementController.updateCategory)
    router.delete('/categories/:id',categoryManagementController.deleteCategory)
    return router
}