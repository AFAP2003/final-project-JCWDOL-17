import storeManagementController from "@/controllers/storeManagement.controller";
import { withAuthentication } from "@/middlewares/auth.middleware";
import { Router } from "express";

export const storeManagementRouter = ()=>{
    const router = Router()

    router.get('/stores',storeManagementController.getStores)
    router.get('/stores/by-admin',withAuthentication, storeManagementController.getStoreByAdminId);
    return router
}