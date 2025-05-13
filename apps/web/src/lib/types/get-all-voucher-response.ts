export type GetAllVoucherResponse = {
  vouchers: {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: 'PRODUCT_SPECIFIC' | 'SHIPPING' | 'REFERRAL';
    valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isForShipping: boolean;
    maxUsage?: number;
    usageCount: number;
    createdAt: string;
    products: { id: string }[];
    users: { id: string }[];
  }[];

  metadata: {
    currentPage: number;
    pageSize: number;
    firstPage: number;
    lastPage: number;
    totalRecord: number;
  };
};
