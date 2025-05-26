import { CreateOrderDTO } from '@/dtos/create-order.dto';
import { ProcessOrderDTO } from '@/dtos/process-order.dto';
import { ShipOrderDTO } from '@/dtos/ship-order.dto';
import { UploadPaymentDTO } from '@/dtos/upload-payment.dto';

import { BadRequestError, ForbiddenError, NotFoundError } from '@/errors';
import { prismaclient } from '@/prisma';
import {
  OrderStatus,
  PaymentMethod,
  PaymentProofStatus,
  PaymentStatus,
  StockJournalType,
} from '@prisma/client';
import { addHours } from 'date-fns';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export class OrderService {
  async createOrder(userId: string, dto: z.infer<typeof CreateOrderDTO>) {
    return prismaclient.$transaction(async (tx) => {
      const cart = await this.getAndValidateCart(tx, userId);

      const address = await this.getAndValidateAddress(
        tx,
        userId,
        dto.addressId,
      );

      if (!address.latitude || !address.longitude) {
        throw new BadRequestError(
          'Address coordinates are required for delivery. Please update your address.',
        );
      }

      const nearestStoreResult = await this.findNearestStoreWithStock(
        tx,
        cart.items,
        address.latitude,
        address.longitude,
      );

      if (!nearestStoreResult.hasAllItems && nearestStoreResult.missingItems) {
        const missingItemsMessage = nearestStoreResult.missingItems
          .map((item) => `"${item.name}"`)
          .join(', ');

        throw new BadRequestError(
          `The following items are not available at the nearest store: ${missingItemsMessage}. Please remove or replace these items to continue.`,
        );
      }

      const nearestStore = nearestStoreResult.store;
      const distance = nearestStoreResult.distance;

      const shippingMethod = await tx.shippingMethod.findUnique({
        where: {
          id: dto.shippingMethodId,
          isActive: true,
        },
      });

      if (!shippingMethod) {
        throw new Error('Shipping method not found');
      }

      const { subtotal, orderItems } = this.calculateOrderItems(cart.items);

      const { totalDiscount, appliedVouchers } = await this.applyVouchers(
        tx,
        dto.vouchers || [],
        subtotal,
      );

      const baseCost = Number(shippingMethod.baseCost);
      const shippingCost = this.calculateShippingFee(distance, baseCost);

      const total = subtotal + shippingCost - totalDiscount;

      const orderNumber = this.generateOrderNumber();
      const expiresAt =
        dto.paymentMethod === PaymentMethod.BANK_TRANSFER
          ? addHours(new Date(), 1)
          : null;

      const distanceNote = `Distance to store: ${distance.toFixed(2)} km`;
      const orderNotes = dto.notes
        ? `${dto.notes}\n${distanceNote}`
        : distanceNote;

      const order = await this.createOrderRecord(
        tx,
        userId,
        nearestStore.id,
        address,
        shippingMethod,
        subtotal,
        shippingCost,
        totalDiscount,
        total,
        dto.paymentMethod,
        orderNotes,
        expiresAt,
        orderNumber,
        orderItems,
        appliedVouchers,
      );

      if (dto.paymentMethod === PaymentMethod.PAYMENT_GATEWAY) {
        await this.processPaymentGateway(
          tx,
          order,
          cart.items,
          nearestStore.id,
          userId,
          orderNumber,
        );
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        ...order,
        distance,
      };
    });
  }

  async uploadPaymentProof(
    userId: string,
    dto: z.infer<typeof UploadPaymentDTO>,
  ) {
    const order = await this.getAndValidateUserOrder(userId, dto.orderId);

    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      throw new BadRequestError(
        'Payment proof can only be uploaded for orders awaiting payment',
      );
    }

    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      throw new BadRequestError('Order has expired');
    }

    const file = dto.file;
    this.validateFile(file);

    const filePath = await this.savePaymentProofFile(file);

    await prismaclient.paymentProof.create({
      data: {
        orderId: order.id,
        filePath,
        status: PaymentProofStatus.PENDING,
      },
    });

    return await prismaclient.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.WAITING_PAYMENT_CONFIRMATION,
        statusHistory: {
          ...(order.statusHistory as object),
          [OrderStatus.WAITING_PAYMENT_CONFIRMATION]: new Date().toISOString(),
        },
        lastStatusChange: new Date(),
      },
      include: {
        paymentProofs: true,
      },
    });
  }

  async getUserOrders(
    userId: string,
    filters: {
      status?: string;
      startDate?: string;
      endDate?: string;
      orderNumber?: string;
    },
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (
      filters.status &&
      Object.values(OrderStatus).includes(filters.status as OrderStatus)
    ) {
      where.status = filters.status as OrderStatus;
    }

    if (filters.startDate) {
      where.createdAt = {
        ...(where.createdAt || {}),
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.createdAt = {
        ...(where.createdAt || {}),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.orderNumber) {
      where.orderNumber = {
        contains: filters.orderNumber,
        mode: 'insensitive',
      };
    }

    const total = await prismaclient.order.count({ where });

    const orders = (await prismaclient.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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
        store: true,
        paymentProofs: true,
      },
    })) as any;

    const ordersWithDistance = await Promise.all(
      orders.map(async (order: any) => {
        let distance: any | null = null;

        if (
          order.store.latitude &&
          order.store.longitude &&
          order.address?.latitude &&
          order.address?.longitude
        ) {
          distance = this.calculateDistance(
            order.address.latitude,
            order.address.longitude,
            order.store.latitude,
            order.store.longitude,
          );
        }

        return {
          ...order,
          distance,
        };
      }),
    );

    return {
      data: ordersWithDistance,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async confirmOrder(userId: string, orderId: string) {
    const order = await this.getAndValidateUserOrder(userId, orderId);

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestError('Only shipped orders can be confirmed');
    }

    return await this.updateOrderStatus(
      order.id,
      OrderStatus.CONFIRMED,
      userId,
    );
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.getAndValidateUserOrder(userId, orderId);

    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      throw new BadRequestError(
        'Only orders awaiting payment can be cancelled by the user',
      );
    }

    return await prismaclient.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: {
          ...(order.statusHistory as object),
          [OrderStatus.CANCELLED]: new Date().toISOString(),
        },
        lastStatusChange: new Date(),
        lastChangedBy: userId,
        cancelReason: 'Cancelled by user',
      },
    });
  }

  async getAdminStore(adminId: string) {
    return await prismaclient.store.findFirst({
      where: {
        adminId,
      },
    });
  }

  async getAdminOrders(
    storeId?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (storeId) where.storeId = storeId;
    if (status) where.status = status;

    const total = await prismaclient.order.count({ where });

    const orders = await prismaclient.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
        store: true,
        address: true,
        paymentProofs: true,
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async processOrder(adminId: string, dto: z.infer<typeof ProcessOrderDTO>) {
    return prismaclient.$transaction(async (tx) => {
      const { order, adminStore } = await this.getAndValidateAdminOrder(
        tx,
        adminId,
        dto.orderId,
      );

      if (order.status !== OrderStatus.WAITING_PAYMENT_CONFIRMATION) {
        throw new BadRequestError(
          'Only orders with payment confirmation pending can be processed',
        );
      }

      if (dto.verifyPayment && dto.paymentProofId) {
        await this.verifyPaymentProof(tx, order, dto.paymentProofId, adminId);
      } else if (dto.verifyPayment && !dto.paymentProofId) {
        throw new Error(
          'paymentProofId is required when verifyPayment is true',
        );
      }

      await this.updateStockForProcessing(
        tx,
        order.items,
        order.storeId,
        adminId,
        order.orderNumber,
      );

      return await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PROCESSING,
          notes: dto.notes || order.notes,
          statusHistory: {
            ...(order.statusHistory as object),
            [OrderStatus.PROCESSING]: new Date().toISOString(),
          },
          lastStatusChange: new Date(),
          lastChangedBy: adminId,
        },
        include: {
          items: true,
          store: true,
          paymentProofs: true,
        },
      });
    });
  }

  async shipOrder(adminId: string, dto: z.infer<typeof ShipOrderDTO>) {
    const order = await prismaclient.order.findUnique({
      where: { id: dto.orderId },
      include: { store: true },
    });

    if (!order) throw new Error('Order not found');

    await this.validateAdminPermission(adminId, order.storeId);

    if (order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestError('Only processed orders can be shipped');
    }

    return await prismaclient.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.SHIPPED,
        trackingNumber: dto.trackingNumber,
        notes: dto.notes || order.notes,
        statusHistory: {
          ...(order.statusHistory as object),
          [OrderStatus.SHIPPED]: new Date().toISOString(),
        },
        lastStatusChange: new Date(),
        lastChangedBy: adminId,
      },
    });
  }

  async adminCancelOrder(adminId: string, orderId: string, reason: string) {
    return prismaclient.$transaction(async (tx) => {
      const { order } = await this.getAndValidateAdminOrder(
        tx,
        adminId,
        orderId,
      );

      if (
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.CONFIRMED
      ) {
        throw new BadRequestError('Cannot cancel shipped or confirmed orders');
      }

      if (order.status === OrderStatus.PROCESSING) {
        await this.restoreStockForCancellation(tx, order, adminId, reason);
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
      });
    });
  }

  private async getAndValidateCart(tx: any, userId: string) {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Your cart is empty');
    }

    return cart;
  }

  private async getAndValidateAddress(
    tx: any,
    userId: string,
    addressId: string,
  ) {
    const address = await tx.address.findUnique({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  private calculateOrderItems(cartItems: any[]) {
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: any;
      discount: number;
      subtotal: number;
    }> = [];

    for (const item of cartItems) {
      const itemSubtotal = Number(item.product.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        discount: 0,
        subtotal: itemSubtotal,
      });
    }

    return { subtotal, orderItems };
  }

  private async applyVouchers(tx: any, voucherIds: string[], subtotal: number) {
    let totalDiscount = 0;
    const appliedVouchers: Array<{
      voucherId: string;
      discount: number;
    }> = [];

    if (voucherIds.length > 0) {
      for (const voucherId of voucherIds) {
        const voucher = await tx.voucher.findUnique({
          where: {
            id: voucherId,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        });

        if (!voucher) continue;

        if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage)
          continue;
        if (voucher.minPurchase && subtotal < Number(voucher.minPurchase))
          continue;

        let voucherDiscount = this.calculateVoucherDiscount(voucher, subtotal);
        totalDiscount += voucherDiscount;

        appliedVouchers.push({
          voucherId: voucher.id,
          discount: voucherDiscount,
        });

        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    return { totalDiscount, appliedVouchers };
  }

  private calculateVoucherDiscount(voucher: any, subtotal: number) {
    let discount = 0;

    if (voucher.valueType === 'PERCENTAGE') {
      discount = (subtotal * Number(voucher.value)) / 100;

      if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
        discount = Number(voucher.maxDiscount);
      }
    } else {
      discount = Number(voucher.value);
    }

    return discount;
  }

  private async createOrderRecord(
    tx: any,
    userId: string,
    storeId: string,
    address: any,
    shippingMethod: any,
    subtotal: number,
    shippingCost: number,
    discount: number,
    total: number,
    paymentMethod: PaymentMethod,
    notes: string | undefined,
    expiresAt: Date | null,
    orderNumber: string,
    orderItems: any[],
    appliedVouchers: any[],
    distance?: number,
  ) {
    return await tx.order.create({
      data: {
        orderNumber,
        userId,
        storeId,
        addressId: address.id,
        shippingMethodId: shippingMethod.id,
        shippingAddress: address.address,
        recipientName: address.recipient,
        recipientPhone: address.phone,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        status: OrderStatus.WAITING_PAYMENT,
        subtotal,
        shippingCost,
        discount,
        total,
        paymentMethod,
        paymentStatus:
          paymentMethod === PaymentMethod.PAYMENT_GATEWAY
            ? PaymentStatus.PAID
            : PaymentStatus.PENDING,
        shippingMethod: shippingMethod.name,
        notes,
        expiresAt,
        statusHistory: {
          [OrderStatus.WAITING_PAYMENT]: new Date().toISOString(),
        },
        items: {
          create: orderItems,
        },
        appliedVouchers: {
          create: appliedVouchers,
        },
      },
      include: {
        items: true,
        address: true,
        store: true,
        appliedVouchers: true,
      },
    });
  }

  private async processPaymentGateway(
    tx: any,
    order: any,
    cartItems: any[],
    storeId: string,
    userId: string,
    orderNumber: string,
  ) {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PROCESSING,
        statusHistory: {
          ...(order.statusHistory as object),
          [OrderStatus.PROCESSING]: new Date().toISOString(),
        },
        lastStatusChange: new Date(),
      },
    });

    for (const item of cartItems) {
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId,
          storeId,
        },
      });

      if (inventory) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockJournal.create({
          data: {
            inventoryId: inventory.id,
            quantity: item.quantity,
            type: StockJournalType.SALE,
            notes: `Order #${orderNumber}`,
            referenceId: order.id,
            createdBy: userId,
          },
        });
      }
    }
  }

  private validateFile(file: any) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestError('Only JPG, JPEG, and PNG files are allowed');
    }

    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestError('File size must be less than 1MB');
    }
  }

  private async savePaymentProofFile(file: any) {
    const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return `/uploads/payment-proofs/${fileName}`;
  }

  private async getAndValidateUserOrder(userId: string, orderId: string) {
    const order = await prismaclient.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  private async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string,
  ) {
    return await prismaclient.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          ...((await prismaclient.order.findUnique({ where: { id: orderId } }))
            ?.statusHistory as object),
          [status]: new Date().toISOString(),
        },
        lastStatusChange: new Date(),
        lastChangedBy: userId,
      },
    });
  }

  private async getAndValidateAdminOrder(
    tx: any,
    adminId: string,
    orderId: string,
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        store: true,
        paymentProofs: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const adminStore = await tx.store.findFirst({
      where: {
        adminId,
      },
    });

    const hasStoreAccess = adminStore && adminStore.id === order.storeId;

    const isSuperAdmin = await tx.user.findFirst({
      where: {
        id: adminId,
        role: 'SUPER',
      },
    });

    if (!hasStoreAccess && !isSuperAdmin) {
      throw new ForbiddenError(
        'You do not have permission to manage this order',
      );
    }

    return { order, adminStore };
  }

  private async validateAdminPermission(adminId: string, storeId: string) {
    const adminStore = await prismaclient.store.findFirst({
      where: {
        adminId,
      },
    });

    if (!adminStore || adminStore.id !== storeId) {
      const isSuperAdmin = await prismaclient.user.findFirst({
        where: {
          id: adminId,
          role: 'SUPER',
        },
      });

      if (!isSuperAdmin) {
        throw new ForbiddenError(
          'You do not have permission to manage this order',
        );
      }
    }
  }

  public async verifyPaymentProof(
    tx: any,
    order: any,
    paymentProofId: string,
    adminId: string,
    notes?: string,
  ) {
    const paymentProof = order.paymentProofs.find(
      (proof: any) =>
        proof.id === paymentProofId &&
        proof.status === PaymentProofStatus.PENDING,
    );

    if (!paymentProof) {
      throw new BadRequestError('Valid payment proof not found');
    }

    await tx.paymentProof.update({
      where: { id: paymentProof.id },
      data: {
        status: PaymentProofStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  }

  private async updateStockForProcessing(
    tx: any,
    orderItems: any[],
    storeId: string,
    adminId: string,
    orderNumber: string,
  ) {
    for (const item of orderItems) {
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId,
          storeId,
        },
      });

      if (!inventory) {
        throw new BadRequestError(
          `Inventory not found for product ${item.productId}`,
        );
      }

      if (inventory.quantity < item.quantity) {
        throw new BadRequestError(
          `Not enough stock for product ${item.productId}`,
        );
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
          notes: `Order #${orderNumber} processed`,
          referenceId: item.orderId,
          createdBy: adminId,
        },
      });
    }
  }

  private async restoreStockForCancellation(
    tx: any,
    order: any,
    adminId: string,
    reason: string,
  ) {
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

  private async findNearestStoreWithStock(
    tx: any,
    cartItems: any[],
    userLat: number,
    userLng: number,
  ) {
    const stores = await tx.store.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        maxDistance: true,
      },
    });

    if (!stores || stores.length === 0) {
      throw new BadRequestError('No active stores available');
    }

    const storesWithDistance: Array<{
      store: any;
      distance: number;
      missingItems: Array<{ productId: string; name: string }>;
    }> = [];

    for (const store of stores) {
      if (!store.latitude || !store.longitude) continue;

      const distance = this.calculateDistance(
        userLat,
        userLng,
        store.latitude,
        store.longitude,
      );

      if (distance > store.maxDistance) continue;

      const missingItems: Array<{ productId: string; name: string }> = [];
      for (const item of cartItems) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            storeId: store.id,
            quantity: { gte: item.quantity },
          },
          include: {
            product: {
              select: { name: true },
            },
          },
        });

        if (!inventory) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          });
          missingItems.push({
            productId: item.productId,
            name: product?.name || 'Unknown product',
          });
        }
      }

      storesWithDistance.push({
        store,
        distance,
        missingItems,
      });
    }

    storesWithDistance.sort((a, b) => a.distance - b.distance);

    const storeWithStock = storesWithDistance.find(
      (store) => store.missingItems.length === 0,
    );

    if (storeWithStock) {
      return {
        store: storeWithStock.store,
        distance: storeWithStock.distance,
        hasAllItems: true,
      };
    }

    if (storesWithDistance.length > 0) {
      return {
        store: storesWithDistance[0].store,
        distance: storesWithDistance[0].distance,
        hasAllItems: false,
        missingItems: storesWithDistance[0].missingItems,
      };
    }

    throw new BadRequestError(
      'No stores available with any of the required items',
    );
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;

    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateShippingFee(
    distance: number,
    baseShippingCost: number,
  ): number {
    const freeDistance = 5;
    const costPerKm = 0.5;

    if (distance <= freeDistance) {
      return baseShippingCost;
    }

    const additionalDistance = distance - freeDistance;
    const additionalCost = additionalDistance * costPerKm;

    return baseShippingCost + additionalCost;
  }

  private generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${timestamp}${random}`;
  }

  async checkExpiredOrders() {
    try {
      const expiredOrders = await prismaclient.order.findMany({
        where: {
          status: OrderStatus.WAITING_PAYMENT,
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      for (const order of expiredOrders) {
        await this.autoCancelExpiredOrder(order.id);
      }

      return { processed: expiredOrders.length };
    } catch (error) {
      console.error('Error checking expired orders:', error);
      throw error;
    }
  }

  async autoCancelExpiredOrder(orderId: string) {
    try {
      return await prismaclient.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          statusHistory: {
            ...((
              await prismaclient.order.findUnique({ where: { id: orderId } })
            )?.statusHistory as object),
            [OrderStatus.CANCELLED]: new Date().toISOString(),
          },
          lastStatusChange: new Date(),
          lastChangedBy: 'SYSTEM',
          cancelReason: 'Order expired due to no payment within time limit',
        },
      });
    } catch (error) {
      console.error(`Error auto-cancelling order ${orderId}:`, error);
      throw error;
    }
  }

  async checkOrdersForAutoConfirmation() {
    try {
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

      for (const order of ordersToConfirm) {
        await this.autoConfirmOrder(order.id);
      }

      return { processed: ordersToConfirm.length };
    } catch (error) {
      console.error('Error checking orders for auto-confirmation:', error);
      throw error;
    }
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

    if (!order) throw new NotFoundError('Order not found');

    const stockChecks = await Promise.all(
      order.items.map(async (item) => {
        const inventory = await prismaclient.inventory.findFirst({
          where: {
            productId: item.productId,
            storeId: order.storeId,
          },
        });

        return {
          productId: item.productId,
          productName: item.product.name,
          orderQuantity: item.quantity,
          stockQuantity: inventory?.quantity || 0,
          available: inventory ? inventory.quantity >= item.quantity : false,
        };
      }),
    );

    const allAvailable = stockChecks.every((check) => check.available);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      stockChecks,
      allAvailable,
    };
  }

  async autoConfirmOrder(orderId: string) {
    try {
      return await prismaclient.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          statusHistory: {
            ...((
              await prismaclient.order.findUnique({ where: { id: orderId } })
            )?.statusHistory as object),
            [OrderStatus.CONFIRMED]: new Date().toISOString(),
          },
          lastStatusChange: new Date(),
          lastChangedBy: 'SYSTEM',
        },
      });
    } catch (error) {
      console.error(`Error auto-confirming order ${orderId}:`, error);
      throw error;
    }
  }

  async applyVoucher(orderId: string, voucherCode: string, userId: string) {
    return prismaclient.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, userId },
        include: {
          items: true,
          appliedVouchers: true,
          address: true,
        },
      });

      if (!order) {
        throw new NotFoundError();
      }

      if (order.status !== OrderStatus.WAITING_PAYMENT) {
        throw new BadRequestError(
          'Vouchers can only be applied to orders awaiting payment',
        );
      }

      const voucher = await tx.voucher.findFirst({
        where: {
          code: voucherCode,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (!voucher) {
        throw new BadRequestError('Voucher not found or expired');
      }

      if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) {
        throw new BadRequestError('Voucher usage limit reached');
      }

      if (
        voucher.minPurchase &&
        Number(order.subtotal) < Number(voucher.minPurchase)
      ) {
        throw new BadRequestError(
          `Minimum purchase of ${voucher.minPurchase} required for this voucher`,
        );
      }

      if (order.appliedVouchers.some((v) => v.voucherId === voucher.id)) {
        throw new BadRequestError('Voucher already applied to this order');
      }

      let discountAmount = 0;
      if (voucher.valueType === 'PERCENTAGE') {
        discountAmount = (Number(order.subtotal) * Number(voucher.value)) / 100;
        if (
          voucher.maxDiscount &&
          discountAmount > Number(voucher.maxDiscount)
        ) {
          discountAmount = Number(voucher.maxDiscount);
        }
      } else {
        discountAmount = Number(voucher.value);
      }

      const newTotal =
        Number(order.subtotal) +
        Number(order.shippingCost) -
        (Number(order.discount) + discountAmount);

      await tx.orderVoucher.create({
        data: {
          orderId: order.id,
          voucherId: voucher.id,
          discount: discountAmount,
        },
      });

      await tx.voucher.update({
        where: { id: voucher.id },
        data: { usageCount: { increment: 1 } },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          discount: Number(order.discount) + discountAmount,
          total: newTotal,
        },
        include: {
          items: true,
          appliedVouchers: {
            include: {
              voucher: true,
            },
          },
        },
      });

      return updatedOrder;
    });
  }

  async searchOrders(userId: string, query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      OR: [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        {
          items: {
            some: {
              product: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          },
        },
      ],
    };

    if (Object.values(OrderStatus).includes(query as OrderStatus)) {
      where.OR.push({ status: query as OrderStatus });
    }

    const total = await prismaclient.order.count({
      where,
    });

    const orders = await prismaclient.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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
        store: true,
        paymentProofs: true,
        address: true,
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
