import {
  BASE_FRONTEND_URL,
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_SERVER_KEY,
} from '@/config';
import { BadRequestError, NotFoundError } from '@/errors';
import { prismaclient } from '@/prisma';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import { addHours } from 'date-fns';
import {
  MidtransCustomer,
  MidtransItem,
  MidtransPaymentRequest,
} from '../types/midtrans.type';

export class PaymentService {
  async createMidtransTransaction(orderId: string) {
    try {
      const order = await prismaclient.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      if (!order) {
        throw new NotFoundError();
      }

      if (order.paymentMethod !== PaymentMethod.PAYMENT_GATEWAY) {
        throw new BadRequestError(
          'Order payment method is not using payment gateway',
        );
      }

      const items: MidtransItem[] = order.items.map((item) => ({
        id: item.productId,
        price: Number(item.price),
        quantity: item.quantity,
        name: item.product.name,
      }));

      items.push({
        id: 'shipping',
        price: Number(order.shippingCost),
        quantity: 1,
        name: `Shipping (${order.shippingMethod})`,
      });

      if (order.discount.toNumber() > 0) {
        items.push({
          id: 'discount',
          price: -Number(order.discount),
          quantity: 1,
          name: 'Discount',
        });
      }

      const customer: MidtransCustomer = {
        first_name: order.user.name,
        email: order.user.email,
        phone: order.recipientPhone || undefined,
      };

      const expiryTime = addHours(new Date(), 1);

      const transactionRequest: MidtransPaymentRequest = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: Math.round(Number(order.total)),
        },
        credit_card: {
          secure: true,
        },
        item_details: items,
        customer_details: customer,
        expiry: {
          start_time: new Date().toISOString(),
          unit: 'hour',
          duration: 1,
        },
        callbacks: {
          finish: `${BASE_FRONTEND_URL}/orders/${order.orderNumber}?status=success`,
          error: `${BASE_FRONTEND_URL}/orders/${order.orderNumber}?status=error`,
          pending: `${BASE_FRONTEND_URL}/orders/${order.orderNumber}?status=pending`,
        },
      };

      const response = await axios.post(
        'https://app.sandbox.midtrans.com/snap/v1/transactions',
        transactionRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
          },
        },
      );

      await prismaclient.paymentGateway.create({
        data: {
          orderId: order.id,
          token: response.data.token,
          redirectUrl: response.data.redirect_url,
          provider: 'MIDTRANS',
          expiresAt: expiryTime,
        },
      });

      if (!order.expiresAt) {
        await prismaclient.order.update({
          where: { id: order.id },
          data: {
            expiresAt: expiryTime,
          },
        });
      }

      return {
        token: response.data.token,
        redirectUrl: response.data.redirect_url,
        clientKey: MIDTRANS_CLIENT_KEY,
      };
    } catch (error) {
      console.error('Error creating Midtrans transaction:', error);
      throw error;
    }
  }

  async handleMidtransWebhook(payload: any) {
    try {
      const {
        order_id: orderNumber,
        transaction_status: status,
        transaction_time: transactionTime,
        signature_key: signatureKey,
      } = payload;

      const order = await prismaclient.order.findUnique({
        where: { orderNumber },
      });

      if (!order) {
        throw new NotFoundError(`Order ${orderNumber} not found`);
      }

      let paymentStatus: PaymentStatus;
      let orderStatus: OrderStatus | undefined;

      switch (status) {
        case 'capture':
        case 'settlement':
          paymentStatus = PaymentStatus.PAID;
          orderStatus = OrderStatus.PROCESSING;
          break;
        case 'pending':
          paymentStatus = PaymentStatus.PENDING;
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
        case 'failure':
          paymentStatus = PaymentStatus.FAILED;
          orderStatus = OrderStatus.CANCELLED;
          break;
        default:
          paymentStatus = PaymentStatus.PENDING;
      }

      const updateData: any = {
        paymentStatus,
        lastChangedBy: 'SYSTEM',
      };

      if (orderStatus) {
        updateData.status = orderStatus;
        updateData.statusHistory = {
          ...(order.statusHistory as object),
          [orderStatus]: new Date().toISOString(),
        };
        updateData.lastStatusChange = new Date();
      }

      if (orderStatus === OrderStatus.PROCESSING) {
        return await prismaclient.$transaction(async (tx) => {
          const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: updateData,
            include: {
              items: true,
            },
          });

          for (const item of updatedOrder.items) {
            const inventory = await tx.inventory.findFirst({
              where: {
                productId: item.productId,
                storeId: order.storeId,
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
                  type: 'SALE',
                  notes: `Order #${order.orderNumber} processed after payment`,
                  referenceId: order.id,
                  createdBy: 'SYSTEM',
                },
              });
            }
          }

          await tx.paymentTransaction.create({
            data: {
              orderId: order.id,
              amount: order.total,
              status: paymentStatus,
              provider: 'MIDTRANS',
              providerTransactionId: payload.transaction_id,
              providerOrderId: payload.order_id,
              paymentMethod: payload.payment_type,
              transactionTime: new Date(transactionTime),
              rawResponse: JSON.stringify(payload),
            },
          });

          return updatedOrder;
        });
      } else {
        const updatedOrder = await prismaclient.order.update({
          where: { id: order.id },
          data: updateData,
        });

        await prismaclient.paymentTransaction.create({
          data: {
            orderId: order.id,
            amount: order.total,
            status: paymentStatus,
            provider: 'MIDTRANS',
            providerTransactionId: payload.transaction_id,
            providerOrderId: payload.order_id,
            paymentMethod: payload.payment_type,
            transactionTime: new Date(transactionTime),
            rawResponse: JSON.stringify(payload),
          },
        });

        return updatedOrder;
      }
    } catch (error) {
      console.error('Error handling Midtrans webhook:', error);
      throw error;
    }
  }
}
