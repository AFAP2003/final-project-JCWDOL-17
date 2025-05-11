'use client';

import { useCart } from '@/context/cart-provider';
import { ApplicableVoucherResponse } from '@/lib/types/applicable-voucher-response';
import { GetNearestStoreResponse } from '@/lib/types/get-nearest-store.response';
import { LocationType } from '@/lib/types/location-type';
import { ShippingCostResponse } from '@/lib/types/shipping-cost-response';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { usePreCheckout } from './use-pre-checkout';

export type CheckoutPrepareError =
  | 'NOT_LOGIN'
  | 'EMPTY_LOCATION'
  | 'EMPTY_CART'
  | 'NO_STORE'
  | 'ALL_PRODUCT_OUT_STOCK'
  | 'NO_COURIER_AVAILABLE';

type CheckoutContextType = {
  isPreparing: boolean;
  prepareError: CheckoutPrepareError | null;
  store: NonNullable<GetNearestStoreResponse['store']>;
  inStockCartItems: ReturnType<typeof useCart>['items'];
  outStockCartItems: ReturnType<typeof useCart>['items'];
  appliedProductDiscounts: ReturnType<
    typeof usePreCheckout
  >['appliedProductDiscounts'];
  destination: LocationType;
  shippings: ShippingCostResponse['data'];
  appliedShipping: ShippingCostResponse['data'][number] | null;
  applyShipping: (shipping: ShippingCostResponse['data'][number]) => void;
  appliedVouchers: ApplicableVoucherResponse;
  applyVoucher: (voucher: ApplicableVoucherResponse[number]) => void;
  clearShoppingVoucher: () => void;
  clearShippingVoucher: () => void;
  clearAllVoucher: () => void;
  price: {
    subtotalDiscountProduct: number;
    subtotalVoucherShopping: number;
    subtotalVoucherShipping: number;
    subtotalShippingCostBefore: number;
    subtotalShippingCostAfter: number;
    subtotalProductBefore: number;
    subtotalProductAfter: number;
    totalAllCost: number;
  };
  setUserNotes: (val: string) => void;
  userNotes: string;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const CheckoutProvider = ({ children }: Props) => {
  const {
    isPreparing,
    error: prepareError,
    store,
    destination,
    inStockCartItems,
    outStockCartItems,
    shippings,
    appliedProductDiscounts,
  } = usePreCheckout();

  const [appliedVouchers, setAppliedVouchers] =
    useState<ApplicableVoucherResponse>([]);

  const [appliedShipping, setAppliedShipping] = useState<
    (typeof shippings)[number] | null
  >(null);

  const subtotalProductBefore = useMemo(() => {
    return inStockCartItems.reduce(
      (subtotal, item) => subtotal + item.quantity * item.product.price,
      0,
    );
  }, [inStockCartItems]);

  const [userNotes, setUserNotes] = useState<string>('');

  const subtotalDiscountProduct = useMemo(() => {
    return appliedProductDiscounts.reduce((total, discount) => {
      return total + (discount?.discountInPrice || 0);
    }, 0);
  }, [appliedProductDiscounts]);

  const subtotalVoucherShopping = useMemo(() => {
    const subtotal = subtotalProductBefore - subtotalDiscountProduct;
    const voucher = appliedVouchers.find((v) => v.type !== 'SHIPPING');

    let result = 0;
    if (voucher) {
      let price = voucher.value;
      if (voucher.valueType === 'PERCENTAGE') {
        price = (voucher.value / 100) * subtotal;
      }

      if (voucher.maxDiscount && price > voucher.maxDiscount) {
        price = voucher.maxDiscount;
      }
      result = price;
    }
    return result;
  }, [appliedVouchers, subtotalDiscountProduct, subtotalProductBefore]);

  const subtotalVoucherShipping = useMemo(() => {
    const subtotal = Number(appliedShipping?.cost) || 0;
    const voucher = appliedVouchers.find((v) => v.type === 'SHIPPING');

    let result = 0;
    if (voucher) {
      let price = voucher.value;
      if (voucher.valueType === 'PERCENTAGE') {
        price = (voucher.value / 100) * subtotal;
      }
      if (voucher.maxDiscount && price > voucher.maxDiscount) {
        price = voucher.maxDiscount!;
      }

      result = price;
    }
    return result;
  }, [appliedVouchers, appliedShipping]);

  const subtotalShippingCostBefore = useMemo(() => {
    return Number(appliedShipping?.cost) || 0;
  }, [appliedShipping]);

  const subtotalShippingCostAfter = useMemo(() => {
    return subtotalShippingCostBefore - subtotalVoucherShipping;
  }, [subtotalShippingCostBefore, subtotalVoucherShipping]);

  const subtotalProductAfter = useMemo(() => {
    return (
      subtotalProductBefore - subtotalDiscountProduct - subtotalVoucherShopping
    );
  }, [subtotalDiscountProduct, subtotalProductBefore, subtotalVoucherShopping]);

  const totalAllCost = useMemo(() => {
    return subtotalProductAfter + subtotalShippingCostAfter;
  }, [subtotalShippingCostAfter, subtotalProductAfter]);

  const applyShipping = useCallback((shipping: (typeof shippings)[number]) => {
    setAppliedShipping(shipping);
  }, []);

  const applyVoucher = useCallback(
    (newVoucher: ApplicableVoucherResponse[number]) => {
      let vouchers = [...appliedVouchers];
      if (newVoucher.type !== 'SHIPPING') {
        vouchers = vouchers.filter((v) => v.type === 'SHIPPING');
        vouchers.push(newVoucher);
      } else if (newVoucher.type === 'SHIPPING') {
        vouchers = vouchers.filter((v) => v.type !== 'SHIPPING');
        vouchers.push(newVoucher);
      }
      setAppliedVouchers(vouchers);
    },
    [appliedVouchers],
  );

  const clearShoppingVoucher = useCallback(() => {
    let vouchers = [...appliedVouchers];
    vouchers = vouchers.filter((v) => v.type === 'SHIPPING');
    setAppliedVouchers(vouchers);
  }, [appliedVouchers]);

  const clearShippingVoucher = useCallback(() => {
    let vouchers = [...appliedVouchers];
    vouchers = vouchers.filter((v) => v.type !== 'SHIPPING');
    setAppliedVouchers(vouchers);
  }, [appliedVouchers]);

  const clearAllVoucher = useCallback(() => {
    setAppliedVouchers([]);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        isPreparing,
        prepareError,
        store,
        destination,
        inStockCartItems,
        outStockCartItems,
        appliedProductDiscounts,
        shippings,
        appliedShipping,
        applyShipping,
        appliedVouchers,
        applyVoucher,
        clearShoppingVoucher,
        clearShippingVoucher,
        clearAllVoucher,
        price: {
          subtotalShippingCostAfter,
          subtotalShippingCostBefore,
          subtotalDiscountProduct,
          subtotalProductAfter,
          subtotalProductBefore,
          subtotalVoucherShipping,
          subtotalVoucherShopping,
          totalAllCost,
        },
        setUserNotes,
        userNotes: userNotes,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

// Custom hook for accessing the context safely
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
