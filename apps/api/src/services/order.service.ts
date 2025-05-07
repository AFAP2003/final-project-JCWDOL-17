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
  // User methods
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

      // Find nearest store with stock
      const nearestStore = await this.findNearestStoreWithStock();

      // if (!nearestStore) {
      //   throw new BadRequestError(
      //     'No stores available with the required stock. Please modify your cart.',
      //   );
      // }

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

      const shippingCost = Number(shippingMethod.baseCost);
      const total = subtotal + shippingCost - totalDiscount;

      const orderNumber = this.generateOrderNumber();
      const expiresAt =
        dto.paymentMethod === PaymentMethod.BANK_TRANSFER
          ? addHours(new Date(), 1)
          : null;

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
        dto.notes,
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

      return order;
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
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { userId, status } : { userId };

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

  async getUserOrderById(userId: string, orderId: string) {
    const order = await prismaclient.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
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
        appliedVouchers: {
          include: {
            voucher: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
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
    return await prismaclient.store.findUnique({
      where: { adminId },
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

      // Verify payment if requested
      if (dto.verifyPayment) {
        await this.verifyPaymentProof(tx, order, dto.paymentProofId, adminId);
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
        OR: [
          { adminId },
          { userId: adminId }, // For super admin
        ],
      },
    });

    if (
      !adminStore ||
      (adminStore.id !== order.storeId && !adminStore.isSuperAdmin)
    ) {
      throw new ForbiddenError(
        'You do not have permission to manage this order',
      );
    }

    return { order, adminStore };
  }

  private async validateAdminPermission(adminId: string, storeId: string) {
    const adminStore = await prismaclient.store.findFirst({
      where: {
        OR: [
          { adminId },
          { userId: adminId }, // For super admin
        ],
      },
    });

    if (
      !adminStore ||
      (adminStore.id !== storeId && !adminStore.isSuperAdmin)
    ) {
      throw new ForbiddenError(
        'You do not have permission to manage this order',
      );
    }
  }

  private async verifyPaymentProof(
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

  private async findNearestStoreWithStock() {}

  private calculateDistance() {}

  private deg2rad(deg: number) {}

  private generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${timestamp}${random}`;
  }
}
