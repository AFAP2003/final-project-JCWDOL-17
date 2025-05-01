export interface GetAllProductResponse {
  products: {
    id: string;
    name: string;
    description?: string;
    price: number;
    weight?: number;
    sku: string;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: string;
      name: string;
      description?: string;
      image?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    images: {
      id: string;
      productId: string;
      imageUrl: string;
      isMain: boolean;
      createdAt: Date;
    }[];
    discounts: {
      id: string;
      storeId: string;
      name: string;
      description?: string;
      type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
      value: number;
      minPurchase?: number;
      maxDiscount?: number;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      buyQuantity?: number;
      getQuantity?: number;
    }[];
  }[];
  metadata: {
    currentPage: number;
    pageSize: number;
    firstPage: number;
    lastPage: number;
    totalRecord: number;
  };
}
