import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { OrderStatus, PaymentStatus } from '@/lib/enums';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ordertManagementAPI() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const fetchOrders = async (
    pageIndex: number,
    pageSize: number,
    filters?: {
      status?: string;
      storeId?: string;
      startDate?: Date;
      endDate?: Date;
      orderNumber?: string;
    },
  ) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      const queryParams = new URLSearchParams();

      if (filters) {
        if (filters.status && filters.status !== 'all') {
          queryParams.append('status', filters.status);
        }

        if (filters.storeId && filters.storeId !== 'all') {
          queryParams.append('storeId', filters.storeId);
        }

        if (filters.startDate) {
          queryParams.append(
            'startDate',
            format(filters.startDate, 'yyyy-MM-dd'),
          );
        }

        if (filters.endDate) {
          queryParams.append('endDate', format(filters.endDate, 'yyyy-MM-dd'));
        }

        if (filters.orderNumber) {
          queryParams.append('orderNumber', filters.orderNumber);
        }
      }

      const orderRes = await fetch(
        `${API_BASE_URL}/dashborad/orders?${queryParams.toString()}`,
      );

      const orderData = await orderRes.json();

      if (orderRes.ok) {
        setOrders(orderData.data || []);
        return orderData;
      } else {
        console.error(
          'Failed to fetch orders:',
          orderData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching orders: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderById = async (orderId: string) => {
    setIsLoading(true);
    try {
      const orderRes = await fetch(
        `${API_BASE_URL}/dashboard/orders/${orderId}`,
      );
      const orderData = await orderRes.json();

      if (orderRes.ok) {
        setOrderDetails(orderData.data);
        console.log('Order details fetched successfully: ', orderData);
        return orderData.data;
      } else {
        console.error(
          'Failed to fetch order details:',
          orderData.message || 'Unknown Error',
        );
        return null;
      }
    } catch (error) {
      console.log('Error fetching order details: ', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (
    orderId: string,
    paymentProofId: string,
    approved: boolean,
    notes?: string,
  ) => {
    try {
      const verifyRes = await fetch(
        `${API_BASE_URL}/dashboard/orders/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentProofId,
            approved,
            notes: notes || '',
          }),
        },
      );

      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        toast({
          description: approved
            ? 'Pembayaran berhasil dikonfirmasi'
            : 'Pembayaran ditolak',
        });
        console.log('Payment verification successful: ', verifyData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal memverifikasi pembayaran',
        });
        console.error(
          'Failed to verify payment:',
          verifyData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error saat memverifikasi pembayaran',
      });
      console.error('Error verifying payment: ', error);
      return false;
    }
  };

  const handleProcessOrder = async (
    orderId: string,
    paymentProofId?: string,
    verifyPayment: boolean = true,
    notes?: string,
  ) => {
    try {
      const processRes = await fetch(
        `${API_BASE_URL}/dashboard/orders/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentProofId,
            verifyPayment,
            notes: notes || '',
          }),
        },
      );

      const processData = await processRes.json();

      if (processRes.ok) {
        toast({
          description: 'Pesanan berhasil diproses',
        });
        console.log('Order processing successful: ', processData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal memproses pesanan',
        });
        console.error(
          'Failed to process order:',
          processData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error saat memproses pesanan',
      });
      console.error('Error processing order: ', error);
      return false;
    }
  };

  const handleShipOrder = async (
    orderId: string,
    trackingNumber: string,
    notes?: string,
  ) => {
    try {
      const shipRes = await fetch(`${API_BASE_URL}/dashboard/orders/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          trackingNumber,
          notes: notes || '',
        }),
      });

      const shipData = await shipRes.json();

      if (shipRes.ok) {
        toast({
          description: 'Pesanan berhasil dikirim',
        });
        console.log('Order shipping successful: ', shipData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal mengirim pesanan',
        });
        console.error(
          'Failed to ship order:',
          shipData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error saat mengirim pesanan',
      });
      console.error('Error shipping order: ', error);
      return false;
    }
  };

  /**
   * Cancel order
   */
  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      const cancelRes = await fetch(`${API_BASE_URL}/dashboard/orders/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          reason,
        }),
      });

      const cancelData = await cancelRes.json();

      if (cancelRes.ok) {
        toast({
          description: 'Pesanan berhasil dibatalkan',
        });
        console.log('Order cancellation successful: ', cancelData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal membatalkan pesanan',
        });
        console.error(
          'Failed to cancel order:',
          cancelData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error saat membatalkan pesanan',
      });
      console.error('Error cancelling order: ', error);
      return false;
    }
  };

  const checkOrderStock = async (orderId: string) => {
    try {
      const stockRes = await fetch(
        `${API_BASE_URL}/dashboard/orders/check-stock/${orderId}`,
      );
      const stockData = await stockRes.json();

      if (stockRes.ok) {
        console.log('Stock check successful: ', stockData);
        return stockData.data;
      } else {
        console.error(
          'Failed to check stock:',
          stockData.message || 'Unknown error',
        );
        return null;
      }
    } catch (error) {
      console.error('Error checking stock: ', error);
      return null;
    }
  };

  return {
    orders,
    isLoading,
    orderDetails,
    fetchOrders,
    fetchOrderById,
    handleVerifyPayment,
    handleProcessOrder,
    handleShipOrder,
    handleCancelOrder,
    checkOrderStock,
  };
}
