import { PaymentMethod } from '../enums';

export interface VoucherProduct {
  id: string;
  name: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  type: string;
  valueType: string;
  discount: number;
  description?: string;
  minPurchase?: number;
  maxDiscount?: number;
  isForShipping?: boolean;
  products?: VoucherProduct[];
  validUntil?: string;
}

export type CheckoutContextType = {
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
  voucherDiscount: number;
  appliedVoucher: Voucher | null;
  setSelectedAddressId: (id: string) => void;
  setSelectedShippingId: (id: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  setVoucherCode: (code: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  applyVoucher: () => Promise<void>;
  initializePayment: (orderId: string) => Promise<void>;
  resetCheckout: () => void;
  setVoucherDiscount: any;
  setAppliedVoucher: any;
};

export interface MidtransConfig {
  token: string;
  clientKey: string;
  redirectUrl?: string;
}
