'use client';

import { useCart } from '@/context/cart-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { PaymentMethod } from '@/lib/enums';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

type CheckoutContextType = {
  addresses: any[];
  shippingMethods: any[];
  selectedAddressId: string;
  selectedShippingId: string;
  paymentMethod: PaymentMethod;
  notes: string;
  voucherCode: string;
  isLoading: boolean;
  isSubmitting: boolean;
  shippingCost: number;
  nearestStore: any;
  shippingDistance: number | null;
  stockAvailability: {
    available: boolean;
    missingItems: any[];
  };
  serviceDetails: any;
  calculatingShipping: boolean;
  shippingError: string | null;
  isOrderSuccess: boolean;
  orderNumber: string;
  total: number;
  setSelectedAddressId: (id: string) => void;
  setSelectedShippingId: (id: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  setVoucherCode: (code: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  applyVoucher: () => Promise<void>;
  initializePayment: (orderId: string) => Promise<void>;
  resetCheckout: () => void;
};

interface MidtransConfig {
  token: string;
  clientKey: string;
  redirectUrl?: string;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.session?.token;
  const { items, subtotal, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(
    PaymentMethod.BANK_TRANSFER,
  );
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingCost, setShippingCost] = useState(0);
  const [nearestStore, setNearestStore] = useState(null);
  const [shippingDistance, setShippingDistance] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [stockAvailability, setStockAvailability] = useState({
    available: true,
    missingItems: [],
  });
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');

  const total = Number(subtotal) + Number(shippingCost);

  useEffect(() => {
    if (!session) {
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);

        const addressResponse = await apiclient.get('/user/address');
        const addressesData = addressResponse.data.addresses || [];
        setAddresses(addressesData);

        if (addressesData.length > 0) {
          const defaultAddress =
            addressesData.find((addr) => addr.isDefault) || addressesData[0];
          setSelectedAddressId(defaultAddress.id);
        }

        const shippingResponse = await apiclient.get('/shipping-methods');
        const shippingData = shippingResponse.data || [];
        setShippingMethods(shippingData);

        if (shippingData.length > 0) {
          setSelectedShippingId(shippingData[0].id);
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
        toast({
          description:
            'Failed to load checkout information. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [session]);

  useEffect(() => {
    setShippingError(null);

    if (
      !selectedAddressId ||
      !selectedShippingId ||
      items.length === 0 ||
      isLoading
    )
      return;

    const calculateShippingCost = async () => {
      try {
        setCalculatingShipping(true);

        const response = await apiclient.post('/shipping/calculation', {
          addressId: selectedAddressId,
          shippingMethodId: selectedShippingId,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });

        let shippingData = response.data?.data;

        if (!shippingData) {
          setShippingError('Shipping data is missing.');
          return;
        }

        if (shippingData.store) {
          setNearestStore(shippingData.store);
          if (shippingData.distance !== undefined) {
            setShippingDistance(shippingData.distance);
          }
        }

        if (
          shippingData.serviceDetails?.isMock ||
          shippingData.calculationMethod === 'mock'
        ) {
          setShippingError('Using estimated shipping due to API limit.');
        }

        setStockAvailability({
          available: shippingData.hasAllItems ?? true,
          missingItems: shippingData.missingItems || [],
        });

        if (shippingData.shippingCost !== undefined) {
          setShippingCost(shippingData.shippingCost);
        } else {
          const selectedMethod = shippingMethods.find(
            (m) => m.id === selectedShippingId,
          );
          if (selectedMethod) setShippingCost(selectedMethod.baseCost);
        }

        if (shippingData.serviceDetails) {
          setServiceDetails(shippingData.serviceDetails);
        }

        if (shippingData.shippingMethods?.length > 0) {
          setShippingMethods(shippingData.shippingMethods);
        }
      } catch (error) {
        console.error('Error calculating shipping cost:', error);
        setShippingError(
          'There was a problem calculating shipping. Using standard rates.',
        );

        const selectedMethod = shippingMethods.find(
          (m) => m.id === selectedShippingId,
        );
        if (selectedMethod) setShippingCost(selectedMethod.baseCost);

        toast({
          description:
            'Could not calculate exact shipping cost. Using standard rates.',
          variant: 'default',
        });
      } finally {
        setCalculatingShipping(false);
      }
    };

    calculateShippingCost();
  }, [
    selectedAddressId,
    selectedShippingId,
    items,
    isLoading,
    shippingMethods,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId || !selectedShippingId) {
      toast({
        description: 'Please complete your address and shipping selections.',
        variant: 'destructive',
      });
      return;
    }

    if (!stockAvailability.available) {
      toast({
        description: 'Some items are unavailable. Please update your cart.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Session:', session);

    try {
      setIsSubmitting(true);

      if (paymentMethod === PaymentMethod.PAYMENT_GATEWAY) {
        const response = await apiclient.post('/payment/initialize', {
          addressId: selectedAddressId,
          shippingMethodId: selectedShippingId,
          vouchers: voucherCode ? [voucherCode] : [],
          notes,
        });

        const data = response.data;
        const { snapToken } = data;

        setOrderNumber(data.orderNumber || '');
        setIsOrderSuccess(false);

        openMidtransSnap(
          snapToken,
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
          data.orderNumber,
        );
      } else {
        // Bank transfer flow → call backend /orders directly
        const response = await apiclient.post('/orders', {
          addressId: selectedAddressId,
          shippingMethodId: selectedShippingId,
          paymentMethod: paymentMethod,
          notes: notes || undefined,
          voucherCode: voucherCode || undefined,
        });

        const orderId = response.data.id;
        setCreatedOrderId(orderId);
        setOrderNumber(response.data.orderNumber);
        setIsOrderSuccess(true);
        clearCart();

        router.push(`/orders/${response.data.orderNumber}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        description:
          (error as any)?.response?.data?.error?.message ||
          'Failed to place order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode || !createdOrderId) return;

    try {
      const response = await apiclient.post('/orders/apply-voucher', {
        orderId: createdOrderId,
        voucherCode: voucherCode,
      });

      toast({
        description: 'Voucher applied successfully',
      });

      return response.data;
    } catch (error) {
      console.error('Error applying voucher:', error);
      toast({
        description:
          error.response?.data?.error?.message || 'Failed to apply voucher',
        variant: 'destructive',
      });
    }
  };

  const initializePayment = async (orderId: string): Promise<void> => {
    try {
      setIsSubmitting(true);

      const response = await apiclient.post('/payment/initialize', {
        orderId,
      });

      const paymentData: MidtransConfig = response.data;

      openMidtransSnap(paymentData.token, paymentData.clientKey, orderId);
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Payment Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to initialize payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMidtransSnap = (
    token: string,
    clientKey: string,
    orderId: string,
  ): void => {
    if (typeof window === 'undefined') return;

    const invokeSnap = () => {
      window.snap.pay(token, {
        onSuccess: () => handlePaymentSuccess(orderId),
        onPending: () => handlePaymentPending(orderId),
        onError: () => handlePaymentError(orderId),
        onClose: () => handlePaymentClose(orderId),
      });
    };

    if (window.snap) {
      invokeSnap();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://app.sandbox.midtrans.com/snap/snap.js"]',
      );
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        script.onload = invokeSnap;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', invokeSnap);
      }
    }
  };

  const handlePaymentSuccess = (orderId: string): void => {
    toast({
      title: 'Payment Successful',
      description: 'Your payment has been processed successfully.',
    });
    // Fetch the updated order or navigate to order details
    router.push(`/orders/${orderId}?status=success`);
  };

  const handlePaymentPending = (orderId: string): void => {
    toast({
      title: 'Payment Pending',
      description: 'Your payment is being processed.',
    });
    router.push(`/orders/${orderId}?status=pending`);
  };

  const handlePaymentError = (orderId: string): void => {
    toast({
      title: 'Payment Failed',
      description: 'There was an error processing your payment.',
      variant: 'destructive',
    });
    router.push(`/orders/${orderId}?status=error`);
  };

  const handlePaymentClose = (orderId: string): void => {
    toast({
      title: 'Payment Canceled',
      description: 'Payment window was closed.',
    });
    router.push(`/orders/${orderId}`);
  };

  const resetCheckout = () => {
    setSelectedAddressId('');
    setSelectedShippingId('');
    setPaymentMethod(PaymentMethod.BANK_TRANSFER);
    setNotes('');
    setVoucherCode('');
    setShippingCost(0);
    setNearestStore(null);
    setShippingDistance(null);
    setServiceDetails(null);
    setStockAvailability({
      available: true,
      missingItems: [],
    });
    setShippingError(null);
    setIsOrderSuccess(false);
    setOrderNumber('');
    setCreatedOrderId('');
  };

  return (
    <CheckoutContext.Provider
      value={{
        addresses,
        shippingMethods,
        selectedAddressId,
        selectedShippingId,
        paymentMethod,
        notes,
        voucherCode,
        isLoading,
        isSubmitting,
        shippingCost,
        nearestStore,
        shippingDistance,
        stockAvailability,
        serviceDetails,
        calculatingShipping,
        shippingError,
        isOrderSuccess,
        orderNumber,
        total,
        setSelectedAddressId,
        setSelectedShippingId,
        setPaymentMethod,
        setNotes,
        setVoucherCode,
        handleSubmit,
        applyVoucher,
        initializePayment,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
