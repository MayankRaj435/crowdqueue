const { redisClient } = require('../config/redis');
const Queue = require('../models/Queue.model');
const { DEFAULTS } = require('../config/constants');
const logger = require('../utils/logger');

const CACHE_PREFIX = 'queue:state:';

const getQueueState = async (queueId) => {
  try {
    const cached = await redisClient.get(`${CACHE_PREFIX}${queueId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn('Redis cache miss', err.message);
  }

  const queue = await Queue.findById(queueId)
    .select('name status currentToken lastTokenIssued avgServiceTimeMs maxCapacity totalServedToday noShowCountToday notifyThreshold organizationId')
    .lean();

  if (!queue) return null;

  const waiting = queue.lastTokenIssued - queue.currentToken;
  const state = {
    ...queue,
    waiting: Math.max(0, waiting),
  };

  try {
    await redisClient.setex(
      `${CACHE_PREFIX}${queueId}`,
      DEFAULTS.QUEUE_CACHE_TTL,
      JSON.stringify(state)
    );
  } catch (err) {
    logger.warn('Redis cache set failed', err.message);
  }

  return state;
};

const invalidateQueueCache = async (queueId) => {
  try {
    await redisClient.del(`${CACHE_PREFIX}${queueId}`);
  } catch (err) {
    logger.warn('Redis cache invalidation failed', err.message);
  }
};

module.exports = { getQueueState, invalidateQueueCache };
