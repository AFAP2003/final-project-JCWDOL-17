export type GetAllProductCategoryResponse = {
  categories: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    productCount: number;
  }[];
  metadata: {
    currentPage: number;
    pageSize: number;
    firstPage: number;
    lastPage: number;
    totalRecord: number;
  };
};
