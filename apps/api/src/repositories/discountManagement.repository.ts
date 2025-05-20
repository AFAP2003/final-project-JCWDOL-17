import { pagination } from '@/helpers/pagination';
import { Discount } from '@/interfaces/discountManagement.interface';
import { prismaclient } from '@/prisma';
class DiscountManagementRepository {
  async getDiscounts(page = 1, take = 10, adminId?: string) {
    const where = adminId ? { store: { adminId } } : {};
    const total = await prismaclient.discount.count({ where });
    const { skip, take: realTake } = pagination(page, take);

    const data = await prismaclient.discount.findMany({
      where,
      skip,
      take: realTake,
      include: {
        store: true,
      },
    });

    return { total, data };
  }

  async createDiscount(discountData: Discount, adminId?: string) {
    const store = await prismaclient.store.findUnique({
      where: {
        adminId: adminId,
      },
    });

    if (!store) {
      throw new Error('Store data not found');
    }
    return await prismaclient.discount.create({
      data: {
        ...discountData,
        storeId: store?.id,
      },
    });
  }

  async updateDiscount(id: string, discountData: Discount) {
    return await prismaclient.discount.update({
      where: {
        id,
      },
      data: {
        ...discountData,
      },
    });
  }

  async deleteDiscount(id: string) {
    return await prismaclient.discount.delete({
      where: {
        id,
      },
    });
  }
}

export default new DiscountManagementRepository();
