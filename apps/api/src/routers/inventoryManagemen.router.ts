import categoryManagementController from "@/controllers/categoryManagement.controller";
import inventoryManagementController from "@/controllers/inventoryManagement.controller";
import { Router } from "express";

export const inventoryManagementRouter =()=>{
    const router = Router()

    router.get('/inventories',inventoryManagementController.getInventories)
    router.post('/inventories',inventoryManagementController.createInventory)
    router.put('/inventories/:id',inventoryManagementController.updateInventory)
    router.delete('/inventories/:id',inventoryManagementController.deleteInventory)
    return router
}