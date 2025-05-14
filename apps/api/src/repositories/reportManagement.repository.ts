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
  async getMonthlySales(year: number) {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const orders = await prismaclient.order.findMany({
      where: {
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

  async getCategorySales(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const items = await prismaclient.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lt: end,
          },
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

  async getProductSales(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const items = await prismaclient.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lt: end,
          },
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

    const totalsByProduct = items.reduce((acc, item) => {
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

  async getStockReport(year: number, month: number, storeId: string) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    // fetch all journals in this period *and* all journals *before* the period
    const [periodJournals, beforeJournals] = await Promise.all([
      prismaclient.stockJournal.findMany({
        where: {
          createdAt: { gte: start, lt: end },
          ...(storeId !== 'all' && { inventory: { storeId } }),
        },
        select: { inventoryId: true, quantity: true, type: true },
      }),
      prismaclient.stockJournal.findMany({
        where: {
          createdAt: { lt: start },
          ...(storeId !== 'all' && { inventory: { storeId } }),
        },
        select: { inventoryId: true, quantity: true, type: true },
      }),
    ]);

    // helper to sum up +/− by inventoryId
    function accumulate(journals: typeof periodJournals) {
      return journals.reduce<
        Record<string, { added: number; removed: number }>
      >((acc, j) => {
        if (!acc[j.inventoryId]) acc[j.inventoryId] = { added: 0, removed: 0 };
        if (j.type === 'ADDITION') acc[j.inventoryId].added += j.quantity;
        if (j.type === 'SUBTRACTION') acc[j.inventoryId].removed += j.quantity;
        return acc;
      }, {});
    }

    const beforeMap = accumulate(beforeJournals);
    const periodMap = accumulate(periodJournals);

    // load all inventories for this store (or all)
    const inventories = await prismaclient.inventory.findMany({
      where: storeId !== 'all' ? { storeId } : {},
      include: { product: true },
    });

    // now build your details array
    const details = inventories.map((inv) => {
      const { added: periodAdded = 0, removed: periodRemoved = 0 } =
        periodMap[inv.id] || {};
      const { added: beforeAdded = 0, removed: beforeRemoved = 0 } =
        beforeMap[inv.id] || {};

      // opening = all movements up *to* the first of period
      const opening = beforeAdded - beforeRemoved;

      // closing = opening + this period’s net movement
      const closing = opening + (periodAdded - periodRemoved);

      return {
        product: inv.product.name,
        opening,
        added: periodAdded,
        removed: periodRemoved,
        closing,
      };
    });

    // summary too…
    const totalProducts = await prismaclient.inventory.count({
      where: storeId !== 'all' ? { storeId } : {},
    });
    const stockAdded = periodJournals
      .filter((j) => j.type === 'ADDITION')
      .reduce((s, j) => s + j.quantity, 0);
    const stockRemoved = periodJournals
      .filter((j) => j.type === 'SUBTRACTION')
      .reduce((s, j) => s + j.quantity, 0);

    return {
      summary: { totalProducts, stockAdded, stockRemoved },
      details,
    };
  }
}

export default new ReportManagementRepository();
