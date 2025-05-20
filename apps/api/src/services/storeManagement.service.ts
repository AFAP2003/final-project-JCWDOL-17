import storeManagementRepository from "@/repositories/storeManagement.repository";

class StoreManagementService{
    async listAllStores(){
        return await storeManagementRepository.getStores()
    }

    async listStoreById(adminId:string){
        return await storeManagementRepository.getStoreByAdminId(adminId)
    }
}

export default new StoreManagementService()