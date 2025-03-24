export type SignupEmailPasswordResponse = {
  message: string;
  confirmationLink: string;
  expiredAt: string;
  email: string;
};
