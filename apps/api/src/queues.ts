import { Queue } from 'bullmq';
import { redisIO } from './redis';

export const VERIFICATION_EMAIL_QUEUE_NAME = 'verification-email-queue';
export const verificationEmailQueue = new Queue(VERIFICATION_EMAIL_QUEUE_NAME, {
  connection: redisIO,
});

// export const TRANSACTION_EXP_WAIT_CONFIRM_TOKEN =
//   'transaction-expiration-waiting-confirmation';
// export const transactionWaitConfirmQueue = new Queue(
//   TRANSACTION_EXP_WAIT_CONFIRM_TOKEN,
//   {
//     connection: redisIO,
//   },
// );
