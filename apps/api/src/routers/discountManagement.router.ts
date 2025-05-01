import discountManagementController from "@/controllers/discountManagement.controller";
import { Router } from "express";

export const discountManagementRouter =()=>{
    const router = Router()

    router.get('/discounts',discountManagementController.getDiscounts)
    router.post('/discounts',discountManagementController.createDiscount)
    router.put('/discounts/:id',discountManagementController.updateDiscount)
    router.delete('/discounts/:id',discountManagementController.deleteDiscount)
    return router
}