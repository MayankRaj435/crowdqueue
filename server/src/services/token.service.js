const Queue = require('../models/Queue.model');
const Token = require('../models/Token.model');
const { invalidateQueueCache } = require('./queue.service');
const { calculateWaitTime } = require('./waitTime.service');

const issueToken = async (queueId, userId, organizationId) => {
  const queue = await Queue.findOneAndUpdate(
    { _id: queueId, status: { $in: ['active'] } },
    { $inc: { lastTokenIssued: 1 } },
    { new: true }
  );

  if (!queue) {
    throw Object.assign(new Error('Queue is not active'), { statusCode: 400, code: 'QUEUE_NOT_ACTIVE' });
  }

  const waiting = queue.lastTokenIssued - queue.currentToken;
  if (waiting > queue.maxCapacity) {
    await Queue.findByIdAndUpdate(queueId, { $inc: { lastTokenIssued: -1 } });
    throw Object.assign(new Error('Queue is full'), { statusCode: 409, code: 'QUEUE_FULL' });
  }

  const estimatedWaitMs = calculateWaitTime(queue, queue.lastTokenIssued);

  const token = await Token.create({
    queueId,
    organizationId,
    userId,
    tokenNumber: queue.lastTokenIssued,
    status: 'waiting',
    estimatedWaitMs,
  });

  if (waiting >= queue.maxCapacity) {
    await Queue.findByIdAndUpdate(queueId, { status: 'full' });
  }

  await invalidateQueueCache(queueId);

  return {
    token,
    queueName: queue.name,
    position: waiting,
  };
};

const cancelToken = async (tokenId, userId, reason) => {
  const token = await Token.findOne({
    _id: tokenId,
    userId,
    status: { $in: ['waiting', 'called'] },
  });

  if (!token) {
    throw Object.assign(new Error('Token not found or cannot be cancelled'), {
      statusCode: 404,
      code: 'TOKEN_NOT_FOUND',
    });
  }

  token.status = 'cancelled';
  token.cancelledAt = new Date();
  token.cancelReason = reason || '';
  await token.save();

  await invalidateQueueCache(token.queueId);

  return token;
};

module.exports = { issueToken, cancelToken };
