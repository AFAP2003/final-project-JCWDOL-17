import { prismaclient } from '@/prisma';

class StoreManagementRepository {
  async getStores() {
    return await prismaclient.store.findMany();
  }

  async getStoreByAdminId(adminId: string) {
    return await prismaclient.store.findUnique({
      where: { adminId },
    });
  }
}

export default new StoreManagementRepository();
