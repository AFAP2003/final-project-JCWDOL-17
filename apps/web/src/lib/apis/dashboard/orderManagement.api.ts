import { useState } from 'react';
import { apiclient } from '@/lib/apiclient';
import { useToast } from '@/hooks/use-toast';
import { OrderStatus } from '@/lib/enums';

export default function orderManagementAPI() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', (page + 1).toString());
      queryParams.append('limit', limit.toString());

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

      // Make the API call
      const response = await apiclient.get(`/orders?${queryParams.toString()}`);

      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
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
      const response = await apiclient.post('/orders/verify-payment', {
        orderId,
        paymentProofId,
        approved,
        notes,
      });

      if (response.data) {
        toast({
          title: approved ? 'Payment Approved' : 'Payment Rejected',
          description: approved
            ? 'Payment has been verified and order is now being processed.'
            : 'Payment has been rejected and order status is set back to awaiting payment.',
          variant: 'default',
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Error',
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
      const response = await apiclient.post('/orders/ship', {
        orderId,
        trackingNumber,
        notes,
      });

      if (response.data) {
        toast({
          title: 'Order Shipped',
          description:
            'Order has been marked as shipped. Customer will need to confirm delivery within 7 days or it will be automatically confirmed.',
          variant: 'default',
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error shipping order:', error);
      toast({
        title: 'Error',
        description: 'Failed to ship order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      const response = await apiclient.post('/orders/cancel', {
        orderId,
        reason,
      });

      if (response.data) {
        toast({
          title: 'Order Cancelled',
          description:
            'Order has been cancelled successfully and stock has been returned.',
          variant: 'default',
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const checkOrderStock = async (orderId: string) => {
    try {
      const response = await apiclient.get(`/orders/check-stock/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking order stock:', error);
      toast({
        title: 'Error',
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
