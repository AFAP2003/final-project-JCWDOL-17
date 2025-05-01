export interface Discount {
    id: string;
    storeId: string;
    name: string;
    description?: string | null;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
    value: string;
    minPurchase?: string | null;
    maxDiscount?: string | null;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  