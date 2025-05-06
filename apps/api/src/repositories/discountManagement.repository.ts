import { pagination } from '@/helpers/pagination';
import { Discount } from '@/interfaces/discountManagement.interface';
import { prismaclient } from '@/prisma';
class DiscountManagementRepository {
  async getDiscounts(page = 1, take = 10) {
    const total = await prismaclient.discount.count();
    const { skip, take: realTake } = pagination(page, take);

    const data = await prismaclient.discount.findMany({
      skip,
      take: realTake,
    });

    return { total, data };
  }

  async createDiscount(discountData: Discount) {
    return await prismaclient.discount.create({
      data: discountData,
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
