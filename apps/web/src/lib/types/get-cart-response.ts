export type GetCartResponse = {
  items: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    addedAt: string;
    updatedAt: string;
    product: {
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
      images: {
        id: string;
        productId: string;
        imageUrl: string;
        isMain: boolean;
        createdAt: string;
      }[];
    };
  }[];
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
