export type UserSession = {
  id: string;
  email: string;
  email_verified: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  referralCode?: string;
  role: 'USER' | 'SUPER' | 'ADMIN';
  phone_verified: boolean;
  createdAt: string;
  updatedAt: string;
  sub: string;
};
