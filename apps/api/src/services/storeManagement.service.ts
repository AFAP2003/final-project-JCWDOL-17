import storeManagementRepository from "@/repositories/storeManagement.repository";

class StoreManagementService{
    async listAllStores(){
        return await storeManagementRepository.getStores()
    }
}

export default new StoreManagementService()