import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentProofStatus,
} from '@prisma/client';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface OrderFilters {
  status?: OrderStatus;
  storeId?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
}

export interface CreateOrderData {
  addressId: string;
  shippingMethodId: string;
  paymentMethod: PaymentMethod;
  vouchers?: string[];
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

export interface VoucherApplication {
  voucherId: string;
  discount: number;
}

export interface StockCheckItem {
  productId: string;
  productName: string;
  required: number;
  available: number;
  hasStock: boolean;
}

export interface StockCheckResult {
  orderId: string;
  orderNumber: string;
  hasAllStock: boolean;
  items: StockCheckItem[];
}

export interface ProcessOrderData {
  orderId: string;
  paymentProofId?: string;
  verifyPayment: boolean;
  notes?: string;
}

export interface ShipOrderData {
  orderId: string;
  trackingNumber?: string;
  notes?: string;
}

export interface VerifyPaymentData {
  orderId: string;
  paymentProofId: string;
  approved: boolean;
  notes?: string;
}

export interface OrderOperationResult {
  success: boolean;
  order: any;
  message?: string;
}

export interface OrderError {
  code:
    | 'ORDER_NOT_FOUND'
    | 'INSUFFICIENT_STOCK'
    | 'INVALID_STATUS'
    | 'PERMISSION_DENIED';
  message: string;
  details?: any;
}

export const OrderValidation = {
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  isValidUUID: (id: string): boolean => {
    return OrderValidation.UUID_REGEX.test(id);
  },

  isValidStatus: (status: string): boolean => {
    return Object.values(OrderStatus).includes(status as OrderStatus);
  },

  isValidPaymentMethod: (method: string): boolean => {
    return Object.values(PaymentMethod).includes(method as PaymentMethod);
  },
};

export const ORDER_CONSTANTS = {
  PAYMENT_EXPIRY_HOURS: 1,
  AUTO_CONFIRM_DAYS: 2,
  MAX_FILE_SIZE: 1024 * 1024,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  FREE_SHIPPING_DISTANCE: 5,
  COST_PER_KM: 0.5,
  DEFAULT_PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
} as const;
