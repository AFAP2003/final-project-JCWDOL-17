import { DiscountType } from '@prisma/client';

export interface Discount {
  id: string;
  storeId: string;
  name: string;
  description?: string | null;
  type: DiscountType;
  value?: string;
  isPercentage?: boolean;
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
