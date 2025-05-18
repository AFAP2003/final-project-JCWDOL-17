import productManagementController from "@/controllers/productManagement.controller";
import { withAuthentication } from "@/middlewares/auth.middleware";
import { withMultipleImageUpload } from "@/middlewares/media.middleware";
import { Router } from "express";

export const productManagementRouter =()=>{
    const router = Router()

    router.get('/products',withAuthentication,productManagementController.getProducts)
    router.get('/products/:id',productManagementController.getProductById)
    router.post('/products',withMultipleImageUpload,productManagementController.createProduct)
    router.put('/products/:id',withMultipleImageUpload,productManagementController.updateProduct)
    router.delete('/products/:id',productManagementController.deleteProduct)
    return router
}