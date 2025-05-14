import orderManagementRepository from '@/repositories/orderManagement.repository';
import { prismaclient } from '@/prisma';
import { ForbiddenError, NotFoundError } from '@/errors';

class OrderManagementService {
  async listAllOrders(page = 1, take = 10, filters = {}) {
    return await orderManagementRepository.getOrders(page, take, filters);
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await orderManagementRepository.getOrderByNumber(orderNumber);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    return order;
  }

  async verifyPaymentProof(
    orderId: string,
    paymentProofId: string,
    approved: boolean,
    adminId: string,
    notes?: string,
  ) {
    const order = await prismaclient.order.findUnique({
      where: { id: orderId },
      include: {
        paymentProofs: true,
        store: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const paymentProof = order.paymentProofs.find(
      (proof) => proof.id === paymentProofId,
    );
    if (!paymentProof) {
      throw new NotFoundError('Payment proof not found for this order');
    }

    await this.validateAdminPermission(order.storeId);

    return await orderManagementRepository.verifyPaymentProof(
      orderId,
      paymentProofId,
      approved,
      adminId,
      notes,
    );
  }

  async shipOrder(
    orderId: string,
    trackingNumber: string,
    adminId: string,
    notes?: string,
  ) {
    const order = await prismaclient.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'PROCESSING') {
      throw new Error('Only orders in PROCESSING state can be shipped');
    }

    await this.validateAdminPermission(order.storeId);

    const stockCheck = await orderManagementRepository.checkOrderStock(orderId);
    if (!stockCheck.hasAllStock) {
      throw new Error('Cannot ship order: some items are out of stock');
    }

    return await orderManagementRepository.shipOrder(
      orderId,
      trackingNumber,
      adminId,
      notes,
    );
  }

  async cancelOrder(orderId: string, adminId: string, reason: string) {
    const order = await prismaclient.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'SHIPPED' || order.status === 'CONFIRMED') {
      throw new Error('Cannot cancel shipped or confirmed orders');
    }

    await this.validateAdminPermission(order.storeId);

    return await orderManagementRepository.cancelOrder(
      orderId,
      adminId,
      reason,
    );
  }

  async checkOrderStock(orderId: string) {
    const order = await prismaclient.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await this.validateAdminPermission(order.storeId);

    return await orderManagementRepository.checkOrderStock(orderId);
  }

  async autoConfirmShippedOrders() {
    return await orderManagementRepository.checkAutoConfirmOrders();
  }

  private async validateAdminPermission(storeId: string) {
    return true;
  }

  async getAdminStore(adminId: string) {
    return await prismaclient.store.findFirst({
      where: {},
    });
  }
}

export default new OrderManagementService();
