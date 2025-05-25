import {
  Order,
  Store,
  Address,
  Product,
  CartItem,
  Voucher,
  OrderItem,
  PaymentProof,
  User,
  Prisma,
} from '@prisma/client';

export interface CartWithItems {
  id: string;
  userId: string;
  items: Array<
    CartItem & {
      product: Product;
    }
  >;
}

export interface AddressWithCoordinates extends Address {
  latitude: number;
  longitude: number;
}

export interface StoreWithLocation extends Store {
  latitude: number;
  longitude: number;
}

export interface OrderItemData {
  productId: string;
  quantity: number;
  price: Prisma.Decimal;
  discount: number;
  subtotal: number;
}

export interface AppliedVoucherData {
  voucherId: string;
  discount: number;
}

export interface VoucherCalculationResult {
  totalDiscount: number;
  appliedVouchers: AppliedVoucherData[];
}

export interface NearestStoreResult {
  store: StoreWithLocation;
  distance: number;
  hasAllItems: boolean;
  missingItems?: Array<{ productId: string; name: string }>;
}

export interface StockValidationResult {
  productId: string;
  productName: string;
  orderQuantity: number;
  stockQuantity: number;
  available: boolean;
}

export interface OrderWithDetails extends Order {
  items: Array<
    OrderItem & {
      product: Product & {
        images?: Array<{ id: string; url: string; isMain: boolean }>;
      };
    }
  >;
  store: Store;
  paymentProofs: PaymentProof[];
  address?: Address;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  appliedVouchers?: Array<{
    voucherId: string;
    discount: number;
    voucher?: Voucher;
  }>;
  distance?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
}

export interface FileUpload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
