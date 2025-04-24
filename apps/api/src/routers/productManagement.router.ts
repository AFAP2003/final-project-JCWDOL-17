import productManagementController from "@/controllers/productManagement.controller";
import { Router } from "express";

export const productManagementRouter =()=>{
    const router = Router()

    router.get('/products',productManagementController.getProducts)
    router.get('/products/:id',productManagementController.getProductById)
    router.post('/products',productManagementController.createProduct)
    router.put('/products/:id',productManagementController.updateProduct)
    router.delete('/products/:id',productManagementController.deleteProduct)
    return router
}