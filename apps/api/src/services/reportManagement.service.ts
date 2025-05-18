import reportManagementRepository from "@/repositories/reportManagement.repository"

class ReportManagementService {
    async fetchAllMonthlySales(year:number,storeId:string = 'all'){
        return await reportManagementRepository.getMonthlySales(year,storeId)
    }

    async fetchCategorySales(year:number,month:number,storeId:string = 'all'){
        return await reportManagementRepository.getCategorySales(year,month,storeId)
    }

    async fetchProductSales(year:number,month:number,storeId:string = 'all'){
        return await reportManagementRepository.getProductSales(year,month,storeId)
    }

    async fetchStockReport(page=1,take=10,year:number,month:number,storeId:string){
        return await reportManagementRepository.getStockReport(page,take,year,month,storeId)
    }
}


export default new ReportManagementService()