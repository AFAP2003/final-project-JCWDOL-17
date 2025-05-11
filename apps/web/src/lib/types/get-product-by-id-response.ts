export type GetProductByIdResponse = {
  id: string;
  name: string;
  description?: string;
  price: number;
  weight?: number;
  sku: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  images: {
    id: string;
    productId: string;
    imageUrl: string;
    isMain: boolean;
    createdAt: string;
  }[];
  discounts: {
    id: string;
    storeId: string;
    name: string;
    description?: string;
    type: 'NO_RULES_DISCOUNT' | 'WITH_MAX_PRICE' | 'BUY_X_GET_Y';
    isPercentage?: boolean;
    value?: number;
    maxDiscount?: number;
    minPurchase?: number;
    buyQuantity?: number;
    getQuantity?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
};
