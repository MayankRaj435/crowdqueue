const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdqueue';

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const start = async () => {
  await mongoose.connect(MONGO_URI, { maxPoolSize: 5 });
  console.log('[Worker] Connected to MongoDB');

  const notificationWorker = new Worker(
    'notifications',
    async (job) => {
      console.log(`[Worker] Processing notification job: ${job.id}`, job.data);
    },
    { connection, concurrency: 5 }
  );

  const cleanupWorker = new Worker(
    'cleanup',
    async (job) => {
      console.log(`[Worker] Processing cleanup job: ${job.id}`, job.data);
    },
    { connection, concurrency: 1 }
  );

  notificationWorker.on('completed', (job) => {
    console.log(`[Worker] Notification job ${job.id} completed`);
  });

  notificationWorker.on('failed', (job, err) => {
    console.error(`[Worker] Notification job ${job?.id} failed:`, err.message);
  });

  cleanupWorker.on('completed', (job) => {
    console.log(`[Worker] Cleanup job ${job.id} completed`);
  });

  console.log('[Worker] BullMQ workers started');
};

start().catch((err) => {
  console.error('[Worker] Failed to start:', err);
  process.exit(1);
});
