import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { OrderStatus } from '@/lib/enums';

export default function orderManagementAPI() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async (
    page = 0,
    limit = 10,
    filters: {
      status?: string;
      storeId?: string;
      startDate?: Date;
      endDate?: Date;
      orderNumber?: string;
    } = {},
  ) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', (page + 1).toString());
      queryParams.append('take', limit.toString());

      if (filters.status) {
        queryParams.append('status', filters.status);
      }

      if (filters.storeId) {
        queryParams.append('storeId', filters.storeId);
      }

      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate.toISOString());
      }

      if (filters.orderNumber) {
        queryParams.append('orderNumber', filters.orderNumber);
      }

      const response = await fetch(
        `${API_BASE_URL}/dashboard/orders?${queryParams.toString()}`,
        {
          credentials: 'include',
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        setOrders(responseData.data || []);
      } else {
        console.error(
          'Failed to fetch orders:',
          responseData.message || 'Unknown error',
        );
        setOrders([]);
        toast({
          description: 'Failed to fetch orders. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        description: 'Failed to fetch orders. Please try again.',
        variant: 'destructive',
      });
      setOrders([]);
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
      const response = await fetch(
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
            notes,
          }),
          credentials: 'include',
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        toast({
          description: approved
            ? 'Payment has been verified and order is now being processed.'
            : 'Payment has been rejected and order status is set back to awaiting payment.',
        });
        return responseData;
      } else {
        throw new Error(responseData.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        description: `Failed to ${approved ? 'approve' : 'reject'} payment. Please try again.`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleShipOrder = async (
    orderId: string,
    trackingNumber: string,
    notes?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/orders/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          trackingNumber,
          notes,
        }),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          description:
            'Order has been marked as shipped. Customer will need to confirm delivery within 7 days or it will be automatically confirmed.',
        });
        return responseData;
      } else {
        throw new Error(responseData.message || 'Failed to ship order');
      }
    } catch (error) {
      console.error('Error shipping order:', error);
      toast({
        description: 'Failed to ship order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/orders/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          reason,
        }),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          description:
            'Order has been cancelled successfully and stock has been returned.',
        });
        return responseData;
      } else {
        throw new Error(responseData.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const checkOrderStock = async (orderId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/orders/check-stock/${orderId}`,
        {
          credentials: 'include',
        },
      );

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        return responseData.data;
      } else {
        throw new Error(responseData.message || 'Failed to check order stock');
      }
    } catch (error) {
      console.error('Error checking order stock:', error);
      toast({
        description: 'Failed to check order stock. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    orders,
    isLoading,
    fetchOrders,
    handleVerifyPayment,
    handleShipOrder,
    handleCancelOrder,
    checkOrderStock,
  };
}
