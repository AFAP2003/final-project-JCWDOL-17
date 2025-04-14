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
    fullName: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
    role: 'USER' | 'ADMIN' | 'SUPER';
    firstName: string;
    lastName: string;
    signupMethod: 'SOCIAL' | 'CREDENTIAL';
    referralCode?: string;
    referredById?: string;
  };
};
