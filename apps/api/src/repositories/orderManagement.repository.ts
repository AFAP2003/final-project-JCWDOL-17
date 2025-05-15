import { prismaclient } from '@/prisma';
import { pagination } from '@/helpers/pagination';
import {
  OrderStatus,
  PaymentProofStatus,
  PaymentStatus,
  StockJournalType,
} from '@prisma/client';

interface OrderFilters {
  storeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
}

interface StockStatusItem {
  productId: string;
  productName: string;
  required: number;
  available: number;
  hasStock: boolean;
}

class OrderManagementRepository {
  async getOrders(page = 1, take = 10, filters: OrderFilters = {}) {
    const { storeId, status, startDate, endDate, orderNumber } = filters;

    const where: any = {};

    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (orderNumber)
      where.orderNumber = { contains: orderNumber, mode: 'insensitive' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await prismaclient.order.count({ where });
    const { skip, take: realTake } = pagination(page, take);

    const data = await prismaclient.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: true,
        address: true,
        paymentProofs: true,
        appliedVouchers: {
          include: {
            voucher: true,
          },
        },
      },
      skip,
      take: realTake,
    });

    return { total, data };
  }

  async getOrderById(id: string) {
    return await prismaclient.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: true,
        address: true,
        paymentProofs: true,
        appliedVouchers: {
          include: {
            voucher: true,
          },
        },
      },
    });
  }

  async getOrderByNumber(orderNumber: string) {
    return await prismaclient.order.findFirst({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: true,
        address: true,
        paymentProofs: true,
        appliedVouchers: {
          include: {
            voucher: true,
          },
        },
      },
    });
  }

  async verifyPaymentProof(
    orderId: string,
    paymentProofId: string,
    approved: boolean,
    verifiedBy: string,
    notes?: string,
  ) {
    return await prismaclient.$transaction(async (tx) => {
      const paymentProof = await tx.paymentProof.update({
        where: { id: paymentProofId },
        data: {
          status: approved
            ? PaymentProofStatus.VERIFIED
            : PaymentProofStatus.REJECTED,
          verifiedAt: new Date(),
          verifiedBy,
          notes,
        },
      });

      const order = await tx.order.findUnique({ where: { id: orderId } });

      if (!order) {
        throw new Error('Order not found');
      }

      const newStatus = approved
        ? OrderStatus.PROCESSING
        : OrderStatus.WAITING_PAYMENT;
      const newPaymentStatus = approved
        ? PaymentStatus.PAID
        : PaymentStatus.PENDING;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentStatus: newPaymentStatus,
          statusHistory: {
            ...(order.statusHistory as object),
            [newStatus]: new Date().toISOString(),
          },
          lastStatusChange: new Date(),
          lastChangedBy: verifiedBy,
        },
        include: {
          items: true,
          paymentProofs: true,
        },
      });

      if (approved) {
        for (const item of updatedOrder.items) {
          const inventory = await tx.inventory.findFirst({
            where: {
              productId: item.productId,
              storeId: order.storeId,
            },
          });

          if (inventory) {
            if (inventory.quantity < item.quantity) {
              throw new Error(`Not enough stock for product ${item.productId}`);
            }

            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantity: { decrement: item.quantity } },
            });

            await tx.stockJournal.create({
              data: {
                inventoryId: inventory.id,
                quantity: item.quantity,
                type: StockJournalType.SALE,
                notes: `Order #${order.orderNumber} processed`,
                referenceId: order.id,
                createdBy: verifiedBy,
              },
            });
          }
        }
      }

      return updatedOrder;
    });
  }

  async shipOrder(
    orderId: string,
    trackingNumber: string,
    shippedBy: string,
    notes?: string,
  ) {
    const order = await prismaclient.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return await prismaclient.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
        trackingNumber,
        notes: notes || order.notes,
        statusHistory: {
          ...(order.statusHistory as object),
          [OrderStatus.SHIPPED]: new Date().toISOString(),
        },
        lastStatusChange: new Date(),
        lastChangedBy: shippedBy,
      },
      include: {
        items: true,
        user: true,
        store: true,
        paymentProofs: true,
      },
    });
  }

  async cancelOrder(orderId: string, adminId: string, reason: string) {
    return await prismaclient.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === OrderStatus.PROCESSING) {
        for (const item of order.items) {
          const inventory = await tx.inventory.findFirst({
            where: {
              productId: item.productId,
              storeId: order.storeId,
            },
          });

          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantity: { increment: item.quantity } },
            });

            await tx.stockJournal.create({
              data: {
                inventoryId: inventory.id,
                quantity: item.quantity,
                type: StockJournalType.RETURN,
                notes: `Order #${order.orderNumber} cancelled: ${reason}`,
                referenceId: order.id,
                createdBy: adminId,
              },
            });
          }
        }
      }

      return await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason,
          statusHistory: {
            ...(order.statusHistory as object),
            [OrderStatus.CANCELLED]: new Date().toISOString(),
          },
          lastStatusChange: new Date(),
          lastChangedBy: adminId,
        },
        include: {
          items: true,
          user: true,
          store: true,
        },
      });
    });
  }

  async checkAutoConfirmOrders() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const ordersToConfirm = await prismaclient.order.findMany({
      where: {
        status: OrderStatus.SHIPPED,
        lastStatusChange: {
          lt: twoDaysAgo,
        },
      },
    });

    const results: any[] = [];
    for (const order of ordersToConfirm) {
      const updatedOrder = await prismaclient.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          statusHistory: {
            ...(order.statusHistory as object),
            [OrderStatus.CONFIRMED]: new Date().toISOString(),
          },
          lastStatusChange: new Date(),
          lastChangedBy: 'SYSTEM',
        },
      });
      results.push(updatedOrder);
    }

    return {
      processed: ordersToConfirm.length,
      orders: results,
    };
  }

  async checkOrderStock(orderId: string) {
    const order = await prismaclient.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const stockStatus: StockStatusItem[] = [];
    let hasAllStock = true;

    for (const item of order.items) {
      const inventory = await prismaclient.inventory.findFirst({
        where: {
          productId: item.productId,
          storeId: order.storeId,
        },
      });

      const hasStock = inventory && inventory.quantity >= item.quantity;

      stockStatus.push({
        productId: item.productId,
        productName: item.product.name,
        required: item.quantity,
        available: inventory ? inventory.quantity : 0,
        hasStock: hasStock || false,
      });

      if (!hasStock) {
        hasAllStock = false;
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      storeId: order.storeId,
      storeName: order.store.name,
      hasAllStock,
      items: stockStatus,
    };
  }
}

export default new OrderManagementRepository();
