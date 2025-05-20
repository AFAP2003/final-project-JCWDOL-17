import categoryManagementController from "@/controllers/categoryManagement.controller";
import inventoryManagementController from "@/controllers/inventoryManagement.controller";
import { Router } from "express";
import { withAuthentication } from '@/middlewares/auth.middleware';

export const inventoryManagementRouter =()=>{
    const router = Router()

    router.get('/inventories',withAuthentication,inventoryManagementController.getInventories)
    router.post('/inventories',withAuthentication,inventoryManagementController.createInventory)
    router.put('/inventories/:id',withAuthentication,inventoryManagementController.updateInventory)
    router.delete('/inventories/:id',inventoryManagementController.deleteInventory)
    return router
}