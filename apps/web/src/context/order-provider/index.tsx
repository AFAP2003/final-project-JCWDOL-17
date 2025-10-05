'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { toast } from '@/hooks/use-toast';
import { OrderContextType } from '@/lib/types/orders';
import { Order } from '@/lib/interfaces/orders';

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(
    null,
  );
  const [uploadingPaymentProof, setUploadingPaymentProof] = useState(false);

  const activeOrders = orders.filter((order) =>
    [
      'WAITING_PAYMENT',
      'WAITING_PAYMENT_CONFIRMATION',
      'PROCESSING',
      'SHIPPED',
    ].includes(order.status),
  );

  const completedOrders = orders.filter(
    (order) => order.status === 'CONFIRMED',
  );

  const cancelledOrders = orders.filter(
    (order) => order.status === 'CANCELLED',
  );

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await apiclient.get('/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      toast({
        description: 'Failed to load your orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderNumber: string) => {
    if (!session || !orderNumber) return;

    try {
      setIsLoading(true);
      const response = await apiclient.get(`/orders/${orderNumber}`);
      setCurrentOrder(response.data);
      return response.data;
    } catch (error) {
      toast({
        description: 'Failed to load order details',
        variant: 'destructive',
      });

      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      const response = await apiclient.post(`/orders/cancel/${orderId}`);

      toast({
        description: 'Order cancelled successfully',
      });

      await fetchOrders();

      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(response.data);
      }

      return response.data;
    } catch (error: any) {
      toast({
        description:
          error.response?.data?.error?.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      const response = await apiclient.post('/orders/confirm', { orderId });

      toast({
        description: 'Order confirmed successfully',
      });

      await fetchOrders();

      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(response.data);
      }

      return response.data;
    } catch (error: any) {
      toast({
        description:
          error.response?.data?.error?.message || 'Failed to confirm order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        description: 'Only JPG, JPEG, and PNG files are allowed',
        variant: 'destructive',
      });
      return;
    }

    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        description: 'File size must be less than 1MB',
        variant: 'destructive',
      });
      return;
    }

    setPaymentProofFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPaymentProof = async (orderId: string) => {
    if (!paymentProofFile) {
      toast({
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingPaymentProof(true);

      const formData = new FormData();
      formData.append('file', paymentProofFile);
      formData.append('orderId', orderId);

      const response = await apiclient.post(
        '/orders/upload-payment',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      toast({
        description: 'Payment proof uploaded successfully',
      });

      setPaymentProofFile(null);
      setPaymentProofPreview(null);

      await fetchOrders();

      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(response.data);
      }

      return response.data;
    } catch (error: any) {
      toast({
        description:
          error.response?.data?.error?.message ||
          'Failed to upload payment proof',
        variant: 'destructive',
      });
    } finally {
      setUploadingPaymentProof(false);
    }
  };

  const searchOrders = async (query: string) => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await apiclient.get('/orders/search', {
        params: { query },
      });
      setOrders(response.data.data || []);
      return response.data;
    } catch (error) {
      toast({
        description: 'Failed to search orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializePayment = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      const response = await apiclient.post('/payment/initialize', {
        orderId,
      });

      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else if (response.data.token) {
      }

      return response.data;
    } catch (error: any) {
      toast({
        description:
          error.response?.data?.error?.message ||
          'Failed to initialize payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        currentOrder,
        isLoading,
        isSubmitting,
        activeTab,
        paymentProofFile,
        paymentProofPreview,
        uploadingPaymentProof,
        fetchOrders,
        fetchOrderDetails,
        cancelOrder,
        confirmOrder,
        setActiveTab,
        handleFileChange,
        uploadPaymentProof,
        searchOrders,
        initializePayment,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};



