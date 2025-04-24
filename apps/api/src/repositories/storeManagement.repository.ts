import { prismaclient } from '@/prisma';

class StoreManagementRepository{
    async getStores(){
        return await prismaclient.store.findMany()
    }
}

export default new StoreManagementRepository()