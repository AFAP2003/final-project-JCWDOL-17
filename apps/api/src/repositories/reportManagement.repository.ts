import { pagination } from '@/helpers/pagination';
import { prismaclient } from '@/prisma';
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

class ReportManagementRepository {
  async getMonthlySales(year: number, storeId: string = 'all') {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const orders = await prismaclient.order.findMany({
      where: {
        ...(storeId !== 'all' ? { storeId } : {}),
        createdAt: {
          gte: start,
          lt: end,
        },
        status: {
          notIn: [
            'WAITING_PAYMENT',
            'WAITING_PAYMENT_CONFIRMATION',
            'CANCELLED',
          ],
        },
        paymentStatus: 'PAID',
      },
    });

    const monthTotals = Array(12).fill(0);
    orders.forEach((o) => {
      const m = o.createdAt.getUTCMonth();
      monthTotals[m] += Number(o.total);
    });

    return monthTotals.map((total, idx) => ({
      month: MONTH_NAMES[idx],
      total,
    }));
  }

  async getCategorySales(year: number, month: number, storeId: string = 'all') {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const items = await prismaclient.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lt: end,
          },
          ...(storeId !== 'all' ? { storeId } : {}),
          paymentStatus: 'PAID',
          status: {
            notIn: [
              'WAITING_PAYMENT',
              'WAITING_PAYMENT_CONFIRMATION',
              'CANCELLED',
            ],
          },
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const totalsByCategory = items.reduce((acc, item) => {
      const cat = item.product.category.name;
      acc[cat] = (acc[cat] || 0) + Number(item.subtotal);
      return acc;
    }, {});

    return Object.entries(totalsByCategory).map(([category, total]) => ({
      category,
      total,
    }));
  }

  async getProductSales(year: number, month: number, storeId: string | 'all') {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const items = await prismaclient.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lt: end,
          },
          ...(storeId !== 'all' ? { storeId } : {}),

          paymentStatus: 'PAID',
          status: {
            notIn: [
              'WAITING_PAYMENT',
              'WAITING_PAYMENT_CONFIRMATION',
              'CANCELLED',
            ],
          },
        },
      },
      include: {
        product: true,
      },
    });

    const totalsByProduct: Record<string, any> = items.reduce((acc, item) => {
      const name = item.product.name;
      acc[name] = acc[name] || { unitsSold: 0, revenue: 0 };
      acc[name].unitsSold += item.quantity;
      acc[name].revenue += Number(item.subtotal);
      return acc;
    }, {});

    const top10 = Object.entries(totalsByProduct)
      .map(([product, { unitsSold, revenue }]) => ({
        product,
        unitsSold,
        revenue,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);

    return top10;
  }

  async getStockReport(
    page: number = 1,
    take: number = 10,
    year: number,
    month: number,
    storeId: string | 'all',
  ) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const { skip, take: realTake } = pagination(page, take);

    // Load inventories scoped to the store (or all)
    const inventories = await prismaclient.inventory.findMany({
      where: storeId !== 'all' ? { storeId } : {},
      include: { product: true },
      skip,
      take: realTake,
    });

    const totalProducts = await prismaclient.inventory.count({
      where: storeId !== 'all' ? { storeId } : {},
    });

    const inventoryIds = inventories.map((inv) => inv.id);

    // Now get journals for these inventories, filtered by storeId through related inventory
    const [periodJournals, beforeJournals] = await Promise.all([
      prismaclient.stockJournal.findMany({
        where: {
          inventoryId: { in: inventoryIds },
          createdAt: { gte: start, lt: end },
          ...(storeId !== 'all' ? { inventory: { storeId } } : {}),
        },
        select: {
          inventoryId: true,
          quantity: true,
          type: true,
        },
      }),
      prismaclient.stockJournal.findMany({
        where: {
          inventoryId: { in: inventoryIds },
          createdAt: { lt: start },
          ...(storeId !== 'all' ? { inventory: { storeId } } : {}),
        },
        select: {
          inventoryId: true,
          quantity: true,
          type: true,
        },
      }),
    ]);

    // Helper to accumulate additions/subtractions per inventoryId
    function accumulate(
      journals: { inventoryId: string; quantity: number; type: string }[],
    ) {
      return journals.reduce<
        Record<string, { added: number; removed: number }>
      >((acc, j) => {
        if (!acc[j.inventoryId]) acc[j.inventoryId] = { added: 0, removed: 0 };
        if (j.type === 'ADDITION') acc[j.inventoryId].added += j.quantity;
        if (j.type === 'SUBTRACTION') acc[j.inventoryId].removed += j.quantity;
        return acc;
      }, {});
    }

    const periodMap = accumulate(periodJournals);
    const beforeMap = accumulate(beforeJournals);

    const details = inventories.map((inv) => {
      const { added: pA = 0, removed: pR = 0 } = periodMap[inv.id] || {};
      const { added: bA = 0, removed: bR = 0 } = beforeMap[inv.id] || {};

      const opening = bA - bR;
      const closing = opening + (pA - pR);

      return {
        product: inv.product.name,
        opening,
        added: pA,
        removed: pR,
        closing,
      };
    });

    const stockAdded = periodJournals
      .filter((j) => j.type === 'ADDITION')
      .reduce((sum, j) => sum + j.quantity, 0);

    const stockRemoved = periodJournals
      .filter((j) => j.type === 'SUBTRACTION')
      .reduce((sum, j) => sum + j.quantity, 0);

    return {
      total: totalProducts,
      data: {
        summary: { totalProducts, stockAdded, stockRemoved },
        details,
      },
    };
  }
}

export default new ReportManagementRepository();
