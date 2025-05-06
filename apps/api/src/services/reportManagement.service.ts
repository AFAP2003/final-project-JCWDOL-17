import reportManagementRepository from "@/repositories/reportManagement.repository"

class ReportManagementService {
    async fetchAllMonthlySales(year:number){
        return await reportManagementRepository.getMonthlySales(year)
    }

    async fetchCategorySales(year:number,month:number){
        return await reportManagementRepository.getCategorySales(year,month)
    }

    async fetchProductSales(year:number,month:number){
        return await reportManagementRepository.getProductSales(year,month)
    }

    async fetchStockReport(year:number,month:number,storeId:string){
        return await reportManagementRepository.getStockReport(year,month,storeId)
    }
}


export default new ReportManagementService()