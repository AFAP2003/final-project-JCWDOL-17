import reportManagementService from '@/services/reportManagement.service';
import repositoryManagementService from '@/services/reportManagement.service';
import { Request, Response, NextFunction } from 'express';

class ReportManagementController{
    async getMonthlySales(req:Request,res:Response,next:NextFunction){
        try {
            const year = parseInt(req.query.year as string,10)
            const data = await reportManagementService.fetchAllMonthlySales(year)
            res.status(200).send({
                success: true,
                message:'Monthly Sales for All Products Fetched Successfully',
                data

            })
        } catch (error) {
            next(error)
        }
    }

    async getCategorySales(req:Request,res:Response,next:NextFunction){
        try {
            const year = parseInt(req.query.year as string,10)
            const month = parseInt(req.query.month as string,10)

            const data = await reportManagementService.fetchCategorySales(year,month)
            res.status(200).send({
                success:true,
                message:'Monthly Sales for Each Category Fetched Successfully',
                data
            })
        } catch (error) {
            next(error)
        }
    }

    async getProductSales(req:Request,res:Response,next:NextFunction){
        try {
            const year = parseInt(req.query.year as string,10)
            const month = parseInt(req.query.month as string,10)

            const data = await reportManagementService.fetchProductSales(year,month)

            res.status(200).send({
                success:true,
                message:'Monthly Sales for Each Products Fetched Successfully',
                data
            })
        } catch (error) {
            next(error)
        }
    }   

    async getStockReport(req:Request,res:Response,next:NextFunction){
        try {
            const year = parseInt(req.query.year as string,10)
            const month = parseInt(req.query.month as string,10)
            const storeId = req.query.storeId as string
            const data = await reportManagementService.fetchStockReport(year,month,storeId)
            res.status(200).send({
                success:true,
                message:'Stock Report Fetched Successfully',
                data
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ReportManagementController()