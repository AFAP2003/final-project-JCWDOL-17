import storeManagementController from "@/controllers/storeManagement.controller";
import { Router } from "express";

export const storeManagementRouter = ()=>{
    const router = Router()

    router.get('/stores',storeManagementController.getStores)
    return router
}