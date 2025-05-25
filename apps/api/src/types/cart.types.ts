import { Decimal } from '@prisma/client/runtime/library';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    price: Decimal;
    images: Array<{ id: string; url: string; isMain: boolean }>;
    discounts: Array<{
      id: string;
      value: number;
      valueType: 'PERCENTAGE' | 'FIXED';
      isActive: boolean;
      endDate: Date;
    }>;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
