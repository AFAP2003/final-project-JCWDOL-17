export type GetAllAccountResponse = {
  id: string;
  provider: 'google' | 'credential' | 'facebook';
  createdAt: string;
  updatedAt: string;
  accountId: string;
  scopes: string[];
}[];
