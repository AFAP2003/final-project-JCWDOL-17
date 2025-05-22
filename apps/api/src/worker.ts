import { Worker } from 'bullmq';
import { prismaclient } from './prisma';
import { VERIFICATION_EMAIL_QUEUE_NAME } from './queues';
import { redisIO } from './redis';

/* ---------------------------------------------------------------- */
/*                    worker for email verifiction                  */
/* ---------------------------------------------------------------- */

const verificationEmailWorker = new Worker(
  VERIFICATION_EMAIL_QUEUE_NAME,
  async (job) => {
    console.log(`Running ${job.id}...`);
    console.log(
      `Task: Attempt to delete verification record with ID #${job.data.verificationId}`,
    );

    const verifRecord = await prismaclient.verification.findUnique({
      where: { id: job.data.verificationId },
    });

    if (!verifRecord) {
      console.log(
        `Verification record with ID #${job.data.verificationId} was deleted`,
      );
    } else {
      await prismaclient.verification.delete({
        where: {
          id: verifRecord.id,
        },
      });
      console.log(
        `Verification record with ID #${job.data.verificationId} was deleted`,
      );
    }
  },
  { connection: redisIO },
);

verificationEmailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

verificationEmailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
