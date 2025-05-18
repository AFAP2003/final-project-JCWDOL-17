import reportManagementController from "@/controllers/reportManagement.controller"
import { Router } from "express"
import { withAuthentication } from "@/middlewares/auth.middleware";

export const reportManagementRouter = ()=>{
    const router = Router()
    router.get('/monthly-sales',withAuthentication,reportManagementController.getMonthlySales)
    router.get('/category-sales',withAuthentication,reportManagementController.getCategorySales)   
    router.get('/product-sales',withAuthentication,reportManagementController.getProductSales)
    router.get('/stock-report',withAuthentication,reportManagementController.getStockReport)
    return router
}