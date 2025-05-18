import discountManagementController from "@/controllers/discountManagement.controller";
import { Router } from "express";
import { withAuthentication } from '@/middlewares/auth.middleware';

export const discountManagementRouter =()=>{
    const router = Router()

    router.get('/discounts',withAuthentication,discountManagementController.getDiscounts)
    router.post('/discounts',withAuthentication,discountManagementController.createDiscount)
    router.put('/discounts/:id',discountManagementController.updateDiscount)
    router.delete('/discounts/:id',discountManagementController.deleteDiscount)
    return router
}