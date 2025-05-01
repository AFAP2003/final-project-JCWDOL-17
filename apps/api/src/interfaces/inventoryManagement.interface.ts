export interface Inventory {
    id: string;
    productId: string;
    storeId: string;
    quantity: number;
    minStock: number;    
    createdAt: Date;
    updatedAt: Date;

}