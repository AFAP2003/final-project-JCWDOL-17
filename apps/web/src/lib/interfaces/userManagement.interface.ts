export interface User {
    id: string;
    role: 'USER' | 'ADMIN' | 'SUPER';
    name: string;
    email: string;
    emailVerified: boolean;
    password?: string | null;
    image?: string | null;
    referralCode?: string | null;
    referredById?: string | null;
    storeId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
  