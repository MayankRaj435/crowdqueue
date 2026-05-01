const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdqueue';

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const start = async () => {
  await mongoose.connect(MONGO_URI, { maxPoolSize: 5 });
  console.log('[Worker] Connected to MongoDB');

  // Simple interval-based background worker
  setInterval(async () => {
    try {
      // 1. Mark tokens as 'no_show' if they were called more than 15 mins ago
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      const staleTokens = await mongoose.connection.db.collection('tokens').updateMany(
        { status: 'called', calledAt: { $lt: fifteenMinsAgo } },
        { $set: { status: 'no_show', updatedAt: new Date() } }
      );
      
      if (staleTokens.modifiedCount > 0) {
        console.log(`[Worker] Marked ${staleTokens.modifiedCount} stale tokens as no_show`);
      }
    } catch (err) {
      console.error('[Worker] Cleanup error:', err.message);
    }
  }, 60 * 1000); // Run every minute

  // 2. Midnight reset for daily counters
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      try {
        const result = await mongoose.connection.db.collection('queues').updateMany(
          {}, // all queues
          { $set: { currentToken: 0, lastTokenIssued: 0, totalServedToday: 0 } }
        );
        console.log(`[Worker] Midnight reset for ${result.modifiedCount} queues`);
      } catch (err) {
        console.error('[Worker] Reset error:', err.message);
      }
    }
  }, 60 * 1000); // Check every minute if it's midnight

  console.log('[Worker] Background cleanup jobs started');
};

start().catch((err) => {
  console.error('[Worker] Failed to start:', err);
  process.exit(1);
});
