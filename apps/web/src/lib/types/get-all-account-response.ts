export type GetAllAccountResponse = {
  id: string;
  provider: 'google' | 'credential' | 'facebook' | 'discord';
  createdAt: string;
  updatedAt: string;
  accountId: string;
  scopes: string[];
}[];
