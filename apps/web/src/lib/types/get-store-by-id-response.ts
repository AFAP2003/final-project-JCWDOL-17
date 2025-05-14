export type GetStoreByIdResponse = {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  maxDistance: number;
  isMain: boolean;
  isActive: boolean;
  createdAt: string; // or Date if parsed
  updatedAt: string; // or Date if parsed
  adminId?: string;
  admin?: {
    id: string;
    role: 'ADMIN';
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    signupMethod: 'CREDENTIAL'[]; // or string[] if other values possible
    createdAt: string;
    updatedAt: string;
    referralCode?: string;
    referredById?: string;
    storeId?: string;
  };
};
