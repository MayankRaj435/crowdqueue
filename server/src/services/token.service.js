const Queue = require('../models/Queue.model');
const Token = require('../models/Token.model');
const { invalidateQueueCache } = require('./queue.service');
const { calculateWaitTime } = require('./waitTime.service');

const issueToken = async (queueId, userId, organizationId) => {
  const queue = await Queue.findOneAndUpdate(
    {
      _id: queueId,
      status: 'active',
      $expr: { $lt: [{ $subtract: ['$lastTokenIssued', '$currentToken'] }, '$maxCapacity'] },
    },
    { $inc: { lastTokenIssued: 1 } },
    { new: true }
  );

  if (!queue) {
    const current = await Queue.findById(queueId).select('status').lean();
    if (current?.status === 'full') {
      throw Object.assign(new Error('Queue is full'), { statusCode: 409, code: 'QUEUE_FULL' });
    }
    throw Object.assign(new Error('Queue is not active'), { statusCode: 400, code: 'QUEUE_NOT_ACTIVE' });
  }

  const waiting = queue.lastTokenIssued - queue.currentToken;
  const estimatedWaitMs = calculateWaitTime(queue, queue.lastTokenIssued);

  let token;
  try {
    token = await Token.create({
      queueId,
      organizationId,
      userId,
      tokenNumber: queue.lastTokenIssued,
      status: 'waiting',
      estimatedWaitMs,
    });
  } catch (err) {
    await Queue.findOneAndUpdate(
      { _id: queueId, lastTokenIssued: queue.lastTokenIssued },
      { $inc: { lastTokenIssued: -1 } }
    );
    throw err;
  }

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
  const token = await Token.findOneAndUpdate(
    { _id: tokenId, userId, status: { $in: ['waiting', 'called'] } },
    { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason || '' },
    { new: true }
  );

  if (!token) {
    throw Object.assign(new Error('Token not found or cannot be cancelled'), {
      statusCode: 404,
      code: 'TOKEN_NOT_FOUND',
    });
  }

  await invalidateQueueCache(token.queueId);
  await Queue.findOneAndUpdate(
    {
      _id: token.queueId,
      status: 'full',
      $expr: { $lt: [{ $subtract: ['$lastTokenIssued', '$currentToken'] }, '$maxCapacity'] },
    },
    { status: 'active' }
  );

  return token;
};

module.exports = { issueToken, cancelToken };
