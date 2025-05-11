import reportManagementController from "@/controllers/reportManagement.controller"
import { Router } from "express"

export const reportManagementRouter = ()=>{
    const router = Router()
    router.get('/monthly-sales',reportManagementController.getMonthlySales)
    router.get('/category-sales',reportManagementController.getCategorySales)   
    router.get('/product-sales',reportManagementController.getProductSales)
    router.get('/stock-report',reportManagementController.getStockReport)
    return router
}