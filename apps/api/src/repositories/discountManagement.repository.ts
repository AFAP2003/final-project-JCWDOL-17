import { pagination } from '@/helpers/pagination';
import { Discount } from '@/interfaces/discountManagement.interface';
import { prismaclient } from '@/prisma';
class DiscountManagementRepository {
  async getDiscounts(
    page = 1,
    take = 10,
    adminId?: string,
    search = '',
    type = '',
    valueType = '',
    status = '',
  ) {
    // Normalize “today” to local 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const andConditions: any[] = [];

    // Admin-scoped
    if (adminId) {
      andConditions.push({ store: { adminId } });
    }

    // Search by name or description
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' as any} },
          { description: { contains: search, mode: 'insensitive' as any} },
        ],
      });
    }

    // Type filter
    if (type && type !== 'all') {
      andConditions.push({ type });
    }

    // Value type filter
    if (valueType && valueType !== 'all') {
      andConditions.push({ isPercentage: valueType === 'Persentase' });
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'Aktif') {
        andConditions.push({
          AND: [
            { startDate: { lte: today } },
            {
              OR: [{ endDate: null }, { endDate: { gte: today } }],
            },
          ],
        });
      } else if (status === 'Inaktif') {
        // not started yet
        andConditions.push({ startDate: { gt: today } });
      } else if (status === 'Kadaluwarsa') {
        // started already
        andConditions.push({ startDate: { lte: today } });
        // expired before today
        andConditions.push({ endDate: { lt: today } });
      }
    }

    const where = andConditions.length ? { AND: andConditions } : {};

    // Count + fetch
    const total = await prismaclient.discount.count({ where });
    const { skip, take: realTake } = pagination(page, take);
    const data = await prismaclient.discount.findMany({
      where,
      skip,
      take: realTake,
      include: { store: true },
      orderBy: { createdAt: 'desc' },
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
