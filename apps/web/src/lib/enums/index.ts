export enum VerificationIdentifier {
  SignupConfirmation = 'SignupConfirmation',
  SigninConfirmation = 'SigninConfirmation',
  ResetPassword = 'ResetPassword',
  NewPassword = 'NewPassword',
  AnonymusSignin = 'AnonymusSignin',
  ResetEmail = 'ResetEmail',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  WAITING_PAYMENT_CONFIRMATION = 'WAITING_PAYMENT_CONFIRMATION',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}
