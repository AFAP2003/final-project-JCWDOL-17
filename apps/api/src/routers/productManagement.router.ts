import productManagementController from "@/controllers/productManagement.controller";
import { withMultipleImageUpload } from "@/middlewares/media.middleware";
import { Router } from "express";

export const productManagementRouter =()=>{
    const router = Router()

    router.get('/products',productManagementController.getProducts)
    router.get('/products/:id',productManagementController.getProductById)
    router.post('/products',withMultipleImageUpload,productManagementController.createProduct)
    router.put('/products/:id',withMultipleImageUpload,productManagementController.updateProduct)
    router.delete('/products/:id',productManagementController.deleteProduct)
    return router
}