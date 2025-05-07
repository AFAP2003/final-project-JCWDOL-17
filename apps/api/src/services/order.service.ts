import { CreateOrderDTO } from '@/dtos/create-order.dto';
import { ProcessOrderDTO } from '@/dtos/process-order.dto';
import { ShipOrderDTO } from '@/dtos/ship-order.dto';
import { UploadPaymentDTO } from '@/dtos/upload-payment.dto';

import { BadRequestError, ForbiddenError } from '@/errors';
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
      // Get cart and validate
      const cart = await this.getAndValidateCart(tx, userId);

      // Get address and validate
      const address = await this.getAndValidateAddress(
        tx,
        userId,
        dto.addressId,
      );

      // Check if address has coordinates
      if (!address.latitude || !address.longitude) {
        throw new BadRequestError(
          'Address coordinates are required for delivery. Please update your address.',
        );
      }

      // Find nearest store with stock
      const nearestStoreResult = await this.findNearestStoreWithStock(
        tx,
        cart.items,
        address.latitude,
        address.longitude,
      );

      // If not all items are available, inform the user
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

      // Get shipping method
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

      // Calculate shipping cost based on distance
      const baseCost = Number(shippingMethod.baseCost);
      const shippingCost = this.calculateShippingFee(distance, baseCost);

      const total = subtotal + shippingCost - totalDiscount;

      const orderNumber = this.generateOrderNumber();
      const expiresAt =
        dto.paymentMethod === PaymentMethod.BANK_TRANSFER
          ? addHours(new Date(), 1)
          : null;

      // Add distance info to order notes
      const distanceNote = `Distance to store: ${distance.toFixed(2)} km`;
      const orderNotes = dto.notes
        ? `${dto.notes}\n${distanceNote}`
        : distanceNote;

      // Create order with shipping details
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
        orderNotes, // Include distance in notes
        expiresAt,
        orderNumber,
        orderItems,
        appliedVouchers,
      );

      // Process payment gateway if selected
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

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        ...order,
        distance, // Add distance to the response but don't store in DB
      };
    });
  }

  async uploadPaymentProof(
    userId: string,
    dto: z.infer<typeof UploadPaymentDTO>,
  ) {
    // Get and validate order
    const order = await this.getAndValidateUserOrder(userId, dto.orderId);

    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      throw new BadRequestError(
        'Payment proof can only be uploaded for orders awaiting payment',
      );
    }

    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      throw new BadRequestError('Order has expired');
    }

    // Validate file
    const file = dto.file;
    this.validateFile(file);

    // Save file
    const filePath = await this.savePaymentProofFile(file);

    // Create payment proof record
    await prismaclient.paymentProof.create({
      data: {
        orderId: order.id,
        filePath,
        status: PaymentProofStatus.PENDING,
      },
    });

    // Update order status
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

    // Build where condition object
    const where: any = { userId };

    // Add status filter if provided and valid
    if (
      filters.status &&
      Object.values(OrderStatus).includes(filters.status as OrderStatus)
    ) {
      where.status = filters.status as OrderStatus;
    }

    // Add date range filters if provided
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

    // Add order number filter if provided
    if (filters.orderNumber) {
      where.orderNumber = {
        contains: filters.orderNumber,
        mode: 'insensitive',
      };
    }

    const total = await prismaclient.order.count({ where });

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
      },
    });

    // Add distance calculation to each order
    const ordersWithDistance = await Promise.all(
      orders.map(async (order) => {
        let distance = null;

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

  // Admin methods
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
      // Get order and validate admin permissions
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

      // Update stock
      await this.updateStockForProcessing(
        tx,
        order.items,
        order.storeId,
        adminId,
        order.orderNumber,
      );

      // Update order status
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
    // Get order and validate admin permissions
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
      // Get order and validate admin permissions
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

      // If order was being processed, restore stock
      if (order.status === OrderStatus.PROCESSING) {
        await this.restoreStockForCancellation(tx, order, adminId, reason);
      }

      // Update order status
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

  // Helper methods
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
        discount: 0, // Will be updated if vouchers apply
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

        // Skip if usage limit reached or minimum purchase not met
        if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage)
          continue;
        if (voucher.minPurchase && subtotal < Number(voucher.minPurchase))
          continue;

        // Calculate discount
        let voucherDiscount = this.calculateVoucherDiscount(voucher, subtotal);
        totalDiscount += voucherDiscount;

        appliedVouchers.push({
          voucherId: voucher.id,
          discount: voucherDiscount,
        });

        // Increment voucher usage count
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
      // Apply max discount if specified
      if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
        discount = Number(voucher.maxDiscount);
      }
    } else {
      // Fixed amount discount
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
    // Update order status
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

    // Update inventory and create stock journals
    for (const item of cartItems) {
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId,
          storeId,
        },
      });

      if (inventory) {
        // Update inventory quantity
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // Create stock journal entry
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
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestError('Only JPG, JPEG, and PNG files are allowed');
    }

    // Check file size (max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      throw new BadRequestError('File size must be less than 1MB');
    }
  }

  private async savePaymentProofFile(file: any) {
    const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    // Move the file to the upload directory
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

    // Check if the user is an admin for this store
    const hasStoreAccess = adminStore && adminStore.id === order.storeId;

    // Check if the user is a super admin
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
      // Check if user is a super admin by role instead of a property
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
  ) {
    const paymentProof = order.paymentProofs.find(
      (proof: any) =>
        proof.id === paymentProofId &&
        proof.status === PaymentProofStatus.PENDING,
    );

    if (!paymentProof) {
      throw new BadRequestError('Valid payment proof not found');
    }

    // Update payment proof status
    await tx.paymentProof.update({
      where: { id: paymentProof.id },
      data: {
        status: PaymentProofStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
    });

    // Update payment status
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
      // Find inventory for the product in the store
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

      // Check if enough stock is available
      if (inventory.quantity < item.quantity) {
        throw new BadRequestError(
          `Not enough stock for product ${item.productId}`,
        );
      }

      // Update inventory quantity
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: { decrement: item.quantity } },
      });

      // Create stock journal entry
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
        // Update inventory quantity
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: { increment: item.quantity } },
        });

        // Create stock journal entry
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
    // Get all active stores
    const stores = await tx.store.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        maxDistance: true,
      },
    });

    if (!stores || stores.length === 0) {
      throw new BadRequestError('No active stores available');
    }

    // Calculate distances and check stock availability
    const storesWithDistance: Array<{
      store: any;
      distance: number;
      missingItems: Array<{ productId: string; name: string }>;
    }> = [];

    for (const store of stores) {
      // Skip stores without coordinates
      if (!store.latitude || !store.longitude) continue;

      // Calculate distance
      const distance = this.calculateDistance(
        userLat,
        userLng,
        store.latitude,
        store.longitude,
      );

      // Check if distance exceeds store's max delivery distance
      if (distance > store.maxDistance) continue;

      // Check stock availability for all items
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

    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);

    // Find the first store with all items in stock
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

    // If no store has all items, return the nearest store with missing items info
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
    // Earth's radius in kilometers
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
    const distance = R * c; // Distance in kilometers

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
}
