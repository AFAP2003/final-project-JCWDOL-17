export type SignupConfirmResponse = {
  message: string;
  confirmationLink: string;
  expiredAt: string;
  email: string;
};
