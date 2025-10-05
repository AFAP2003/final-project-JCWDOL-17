'use client';

import { useCart } from '@/context/cart-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { PaymentMethod } from '@/lib/enums';
import {
  CheckoutContextType,
  MidtransConfig,
  Voucher,
} from '@/lib/types/checkout-type';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.session?.token;
  const { items, subtotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
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
  const [nearestStore, setNearestStore] = useState<any>(null);
  const [shippingDistance, setShippingDistance] = useState<number | null>(null);
  const [serviceDetails, setServiceDetails] = useState<any>(null);
  const [stockAvailability, setStockAvailability] = useState({
    available: true,
    missingItems: [],
  });
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null); // Fix type

  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

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
            addressesData.find((addr: any) => addr.isDefault) ||
            addressesData[0]; //
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
            (m: any) => m.id === selectedShippingId,
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
          (m: any) => m.id === selectedShippingId,
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

    if (!stockAvailability.available && !shippingError) {
      toast({
        description: 'Some items are unavailable. Please update your cart.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        addressId: selectedAddressId,
        shippingMethodId: selectedShippingId,
        paymentMethod: paymentMethod,
        notes: notes || undefined,

        vouchers: appliedVoucher ? [appliedVoucher.id] : [],
      };

      console.log('Submitting order with payload:', orderPayload);

      if (paymentMethod === PaymentMethod.PAYMENT_GATEWAY) {
        const response = await apiclient.post(
          '/payment/initialize',
          orderPayload,
        );

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
        const response = await apiclient.post('/orders', orderPayload);

        const orderId = response.data.id;
        setCreatedOrderId(orderId);
        setOrderNumber(response.data.orderNumber);
        setIsOrderSuccess(true);
        clearCart();

        router.push(`/orders/${response.data.orderNumber}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);

      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }

      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to place order';

      toast({
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode) {
      toast({
        description: 'Please enter a voucher code',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiclient.post('/voucher/validate', {
        code: voucherCode,
        subtotal: subtotal,
      });

      if (!response.data.voucher) {
        throw new Error('Invalid voucher response');
      }

      const voucherData = response.data.voucher;
      const discountAmount = Number(voucherData.discount) || 0;

      if (
        voucherData.type === 'PRODUCT_SPECIFIC' &&
        voucherData.products?.length > 0
      ) {
        const voucherProductIds = voucherData.products.map((p: any) => p.id);
        const eligibleItems = items.filter((item) =>
          voucherProductIds.includes(item.product.id),
        );

        if (eligibleItems.length === 0) {
          toast({
            description:
              'This voucher applies to specific products that are not in your cart',
            variant: 'destructive',
          });
          return;
        }

        const eligibleSubtotal = eligibleItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );

        if (
          voucherData.minPurchase &&
          eligibleSubtotal < Number(voucherData.minPurchase)
        ) {
          toast({
            description: `You need to have at least ${formatCurrency(voucherData.minPurchase)} of eligible products to use this voucher`,
            variant: 'destructive',
          });
          return;
        }
      } else if (
        voucherData.minPurchase &&
        subtotal < Number(voucherData.minPurchase)
      ) {
        toast({
          description: `A minimum purchase of ${formatCurrency(voucherData.minPurchase)} is required for this voucher`,
          variant: 'destructive',
        });
        return;
      }

      setVoucherDiscount(discountAmount);
      setAppliedVoucher(voucherData);

      toast({
        description: `Voucher "${voucherData.name}" applied! You saved ${formatCurrency(discountAmount)}`,
      });
    } catch (error: any) {
      console.error('Error applying voucher:', error);
      setVoucherDiscount(0);
      setAppliedVoucher(null);

      toast({
        description:
          error.response?.data?.error?.message || 'Invalid voucher code',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
      (window as any).snap.pay(token, {
        onSuccess: () => handlePaymentSuccess(orderId),
        onPending: () => handlePaymentPending(orderId),
        onError: () => handlePaymentError(orderId),
        onClose: () => handlePaymentClose(orderId),
      });
    };
      
    if ((window as any).snap) {
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
        appliedVoucher,
        voucherDiscount,
        setVoucherDiscount,
        setAppliedVoucher,
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
