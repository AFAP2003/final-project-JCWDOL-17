export type GetAllAvailableAdminResponse = {
  id: string;
  role: 'ADMIN';
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: Date;
  signupMethod: 'CREDENTIAL'[];
  createdAt: Date;
  updatedAt: Date;
  referralCode?: string;
  referredById?: string;
  storeId?: string;
}[];
