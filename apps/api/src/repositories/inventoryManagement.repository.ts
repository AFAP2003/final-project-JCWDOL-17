import { pagination } from '@/helpers/pagination';
import { Inventory } from '@/interfaces/inventoryManagement.interface';
import { prismaclient } from '@/prisma';
class InventoryManagementRepository {
  async getInventories(
    page = 1,
    take = 10,
    adminStoreId?: string,
    search = '',
    filterStoreId?: string,
    categoryId?: string,
    status?: string,
  ) {
    const where: any = {};

    // Store filtering logic
    if (adminStoreId) {
      where.storeId = adminStoreId;
    } else if (filterStoreId && filterStoreId !== 'all') {
      // Find store by name and get its ID
      const store = await prismaclient.store.findFirst({
        where: { name: filterStoreId },
      });
      if (store) {
        where.storeId = store.id;
      }
    }

    where.product = {};

    // Category filtering logic - find category by name
    if (categoryId && categoryId !== 'all') {
      const category = await prismaclient.category.findFirst({
        where: { name: categoryId },
      });
      if (category) {
        where.product.categoryId = category.id;
      }
    }

    // Search logic
    if (search) {
      where.product.OR = [
        { name: { contains: search, mode: 'insensitive' as any } },
        { sku: { contains: search, mode: 'insensitive' as any} },
      ];
    }

    const allData = await prismaclient.inventory.findMany({
      where,
      include: {
        product: { include: { category: true, images: true } },
        store: true,
      },
    });

    let filtered = allData;
    if (status && status !== 'all') {
      filtered = allData.filter((inv) => {
        if (status === 'Stok Habis') return inv.quantity === 0;
        if (status === 'Stok Rendah')
          return inv.quantity > 0 && inv.quantity <= inv.minStock;
        if (status === 'Stok Tersedia') return inv.quantity > inv.minStock;
        return true;
      });
    }

    const total = filtered.length;
    const { skip, take: realTake } = pagination(page, take);
    const data = filtered.slice(skip, skip + realTake);

    return { total, data };
  }

  async createInventory(inventoryData: Inventory) {
    const inv = await prismaclient.inventory.create({
      data: inventoryData,
    });

    if (inv.quantity > 0) {
      await prismaclient.stockJournal.create({
        data: {
          inventoryId: inv.id,
          type: 'ADDITION',
          quantity: inv.quantity,
          createdBy: 'system',
        },
      });
    }
    return inv;
  }

  async updateInventory(
    id: string,
    inventoryData: Partial<Inventory>,
    addQuantity = 0,
    subtractQuantity = 0,
  ) {
    const current = await prismaclient.inventory.findUnique({ where: { id } });
    if (!current) throw new Error('Inventory not found');

    let newQty = current.quantity + addQuantity - subtractQuantity;
    if (newQty < 0) newQty = 0;

    const inv = await prismaclient.inventory.update({
      where: { id },
      data: {
        ...inventoryData,
        quantity: newQty,
      },
    });

    if (addQuantity > 0) {
      await prismaclient.stockJournal.create({
        data: {
          inventoryId: inv.id,
          quantity: addQuantity,
          type: 'ADDITION',
          createdBy: 'system',
        },
      });
    }

    if (subtractQuantity > 0) {
      await prismaclient.stockJournal.create({
        data: {
          inventoryId: inv.id,
          quantity: subtractQuantity,
          type: 'SUBTRACTION',
          createdBy: 'system',
        },
      });
    }

    return inv;
  }

  async deleteInventory(id: string) {
    return await prismaclient.$transaction(async (tx) => {
      await tx.stockJournal.deleteMany({ where: { inventoryId: id } });

      const inv = await tx.inventory.delete({ where: { id } });

      return inv;
    });
  }
}

export default new InventoryManagementRepository();
