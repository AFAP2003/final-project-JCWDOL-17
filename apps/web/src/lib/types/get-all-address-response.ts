export type GetAllAddressResponse = {
  addresses: {
    id: string;
    isDefault: boolean;
    label: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    recipient: string;
    phone: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
    userId: string;
  }[];
  metadata: {
    currentPage: number;
    pageSize: number;
    firstPage: number;
    lastPage: number;
    totalRecord: number;
  };
};
