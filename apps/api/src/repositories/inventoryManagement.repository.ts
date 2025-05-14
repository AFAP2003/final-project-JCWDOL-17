import { prismaclient } from '@/prisma';
import { Inventory } from '@/interfaces/inventoryManagement.interface';
import { pagination } from '@/helpers/pagination';
class InventoryManagementRepository {
  async getInventories(page = 1, take = 10) {
    const total = await prismaclient.inventory.count();

    const { skip, take: realTake } = pagination(page, take);
    const data = await prismaclient.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
            images: true,
          },
        },
        store: true,
      },
      skip,
      take: realTake,
    });

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
          createdBy: 'andi',
        },
      });
    }
    return inv;
  }

  async updateInventory(
    id: string,
    inventoryData: Inventory,
    addQuantity = 0,
    subtractQuantity = 0,
  ) {
    const current = await prismaclient.inventory.findUnique({ where: { id } });
    if (!current) throw new Error('Inventory not found');

    let newQty = current.quantity + addQuantity - subtractQuantity;
    if (newQty < 0) newQty = 0;
    // 1) overwrite everything in inventoryData (but this might not touch quantity!)
    const inv = await prismaclient.inventory.update({
      where: { id },
      data: {
        ...inventoryData,
        quantity: newQty,
      },
    });

    // 2) write ADDITION journal
    if (addQuantity > 0) {
      await prismaclient.stockJournal.create({
        data: {
          inventoryId: inv.id,
          quantity: addQuantity,
          type: 'ADDITION',
          createdBy: 'andi',
        },
      });
    }

    // 3) write SUBTRACTION journal
    if (subtractQuantity > 0) {
      await prismaclient.stockJournal.create({
        data: {
          inventoryId: inv.id,
          quantity: subtractQuantity,
          type: 'SUBTRACTION',
          createdBy: 'andi',
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
