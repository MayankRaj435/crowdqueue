const Queue = require('../models/Queue.model');
const { DEFAULTS } = require('../config/constants');

const calculateWaitTime = (queue, tokenNumber) => {
  const tokensAhead = tokenNumber - queue.currentToken - 1;
  if (tokensAhead <= 0) return 0;

  const avgMs = queue.avgServiceTimeMs || DEFAULTS.AVG_SERVICE_TIME_MS;
  const totalProcessed = queue.totalServedToday + 1;
  const noShowRate = queue.noShowCountToday / totalProcessed;
  const effectiveTokensAhead = Math.ceil(tokensAhead * (1 - noShowRate * 0.5));

  return effectiveTokensAhead * avgMs;
};

const updateRollingAverage = async (queueId, serviceTimeMs) => {
  const queue = await Queue.findById(queueId);
  if (!queue) return;

  const times = [...queue.recentServiceTimes, serviceTimeMs].slice(-DEFAULTS.ROLLING_AVG_WINDOW);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;

  await Queue.findByIdAndUpdate(queueId, {
    recentServiceTimes: times,
    avgServiceTimeMs: Math.round(avg),
  });
};

module.exports = { calculateWaitTime, updateRollingAverage };
