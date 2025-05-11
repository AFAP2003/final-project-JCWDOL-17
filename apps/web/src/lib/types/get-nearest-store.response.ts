export type GetNearestStoreResponse = {
  message: string;
  store: {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    maxDistance: number;
    isActive: boolean;
    isMain: boolean;
    createdAt: string;
    updatedAt: string;
    adminId?: string;
  } | null;
};
