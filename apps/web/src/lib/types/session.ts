export type Session = {
  session: {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
    userId: string;
  };
  user: {
    id: string;
    role: 'USER' | 'ADMIN' | 'SUPER';
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE';
    dateOfBirth?: Date;
    signupMethod: ('CREDENTIAL' | 'SOCIAL')[];
    createdAt: Date;
    updatedAt: Date;
    referralCode?: string;
    referredById?: string;
    storeId?: string;
  };
};
