const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdqueue';

const start = async () => {
  await mongoose.connect(MONGO_URI, { maxPoolSize: 5 });
  console.log('[Worker] Connected to MongoDB');

  let cleanupRunning = false;
  let lastResetDate = null;

  const cleanupNoShows = async () => {
    if (cleanupRunning) return;
    cleanupRunning = true;
    try {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      const tokens = mongoose.connection.db.collection('tokens');
      const staleTokens = await tokens.find(
        { status: 'called', calledAt: { $lt: fifteenMinsAgo } },
        { projection: { _id: 1, queueId: 1 } }
      ).toArray();

      if (staleTokens.length > 0) {
        await tokens.updateMany(
          { _id: { $in: staleTokens.map((token) => token._id) }, status: 'called' },
          { $set: { status: 'no_show', updatedAt: new Date() } }
        );

        const noShowsByQueue = staleTokens.reduce((counts, token) => {
          const queueId = String(token.queueId);
          counts.set(queueId, (counts.get(queueId) || 0) + 1);
          return counts;
        }, new Map());
        await mongoose.connection.db.collection('queues').bulkWrite(
          [...noShowsByQueue].map(([queueId, count]) => ({
            updateOne: {
              filter: { _id: new mongoose.Types.ObjectId(queueId) },
              update: { $inc: { noShowCountToday: count } },
            },
          }))
        );
        console.log(`[Worker] Marked ${staleTokens.length} stale tokens as no_show`);
      }
    } catch (err) {
      console.error('[Worker] Cleanup error:', err.message);
    } finally {
      cleanupRunning = false;
    }
  };

  const resetDailyCounters = async () => {
    const now = new Date();
    const resetDate = now.toISOString().slice(0, 10);
    if (now.getUTCHours() !== 0 || now.getUTCMinutes() !== 0 || lastResetDate === resetDate) return;

    try {
      const result = await mongoose.connection.db.collection('queues').updateMany(
        { status: { $in: ['active', 'paused', 'full'] } },
        {
          $set: {
            currentToken: 0,
            lastTokenIssued: 0,
            totalServedToday: 0,
            noShowCountToday: 0,
          },
        }
      );
      lastResetDate = resetDate;
      console.log(`[Worker] Midnight reset for ${result.modifiedCount} queues`);
    } catch (err) {
      console.error('[Worker] Reset error:', err.message);
    }
  };

  setInterval(cleanupNoShows, 60 * 1000);
  setInterval(resetDailyCounters, 60 * 1000);

  console.log('[Worker] Background cleanup jobs started');
};

start().catch((err) => {
  console.error('[Worker] Failed to start:', err);
  process.exit(1);
});
