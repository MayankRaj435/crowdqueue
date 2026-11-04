const Joi = require('joi');
const Queue = require('../models/Queue.model');
const Token = require('../models/Token.model');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');
const { getQueueState, invalidateQueueCache } = require('../services/queue.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { emitQueueUpdate, emitToUser } = require('../socket/queueSocket');
const { notifyTokenCalled } = require('../services/sms.service');

const createQueueSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().max(500).optional().allow(''),
  maxCapacity: Joi.number().integer().min(1).max(10000).optional(),
  notifyThreshold: Joi.number().integer().min(1).max(20).optional(),
});
const updateQueueSchema = createQueueSchema.fork(['name'], (schema) => schema.optional()).min(1);
const statusSchema = Joi.object({ status: Joi.string().valid('active', 'paused', 'closed', 'full').required() });

const canManageQueue = (queue, user) => (
  user.role === 'super_admin'
  || (user.organizationId && String(queue.organizationId) === String(user.organizationId))
);

const createQueue = async (req, res, next) => {
  try {
    const { error, value } = createQueueSchema.validate(req.body);
    if (error) {
      return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    }

    const org = await Organization.findOne({ adminId: req.user.userId }).lean();
    if (!org) {
      return sendError(res, 'ORG_NOT_FOUND', 'You do not have a registered organization', 404);
    }

    const queue = await Queue.create({
      ...value,
      organizationId: org._id,
    });

    sendSuccess(res, { queue }, 'Queue created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getQueueById = async (req, res, next) => {
  try {
    const state = await getQueueState(req.params.id);
    if (!state) {
      return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);
    }
    sendSuccess(res, { queue: state });
  } catch (err) {
    next(err);
  }
};

const updateQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);
    }

    const org = await Organization.findOne({ adminId: req.user.userId }).lean();
    if (!org || String(queue.organizationId) !== String(org._id)) {
      return sendError(res, 'FORBIDDEN', 'You do not have permission to update this queue', 403);
    }

    const { error, value: updates } = updateQueueSchema.validate(req.body, { stripUnknown: true });
    if (error) return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);

    const updated = await Queue.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    await invalidateQueueCache(req.params.id);

    sendSuccess(res, { queue: updated }, 'Queue updated successfully');
  } catch (err) {
    next(err);
  }
};

const updateQueueStatus = async (req, res, next) => {
  try {
    const { error, value } = statusSchema.validate(req.body);
    if (error) return sendError(res, 'VALIDATION_ERROR', error.details[0].message, 400);
    const { status } = value;

    const existing = await Queue.findById(req.params.id).lean();
    if (!existing) return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);
    if (!canManageQueue(existing, req.user)) return sendError(res, 'FORBIDDEN', 'You do not have permission to update this queue', 403);
    const queue = await Queue.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();

    if (!queue) return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);

    await invalidateQueueCache(req.params.id);

    const io = req.app.get('io');
    if (io) {
      io.to(`queue:${req.params.id}`).emit('queue:status_change', { status });
    }

    sendSuccess(res, { queue }, `Queue status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

const deleteQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);

    const org = await Organization.findOne({ adminId: req.user.userId }).lean();
    if (!org || String(queue.organizationId) !== String(org._id)) {
      return sendError(res, 'FORBIDDEN', 'You do not have permission to delete this queue', 403);
    }

    await Queue.findByIdAndDelete(req.params.id);
    await invalidateQueueCache(req.params.id);

    sendSuccess(res, null, 'Queue deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getMyQueues = async (req, res, next) => {
  try {
    const org = req.user.organizationId
      ? await Organization.findById(req.user.organizationId).lean()
      : await Organization.findOne({ adminId: req.user.userId }).lean();
    if (!org) return sendError(res, 'ORG_NOT_FOUND', 'No organization found for your account', 404);

    const queues = await Queue.find({ organizationId: org._id }).lean();
    const queuesWithWaiting = queues.map((q) => ({
      ...q,
      waiting: Math.max(0, q.lastTokenIssued - q.currentToken),
    }));

    sendSuccess(res, { queues: queuesWithWaiting });
  } catch (err) {
    next(err);
  }
};

const callNext = async (req, res, next) => {
  try {
    const existingQueue = await Queue.findById(req.params.id).lean();
    if (!existingQueue) return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);
    if (!canManageQueue(existingQueue, req.user)) return sendError(res, 'FORBIDDEN', 'You do not have permission to call tokens for this queue', 403);

    const queue = await Queue.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['active', 'full'] }, $expr: { $lt: ['$currentToken', '$lastTokenIssued'] } },
      { $inc: { currentToken: 1, totalServedToday: 1 }, $set: { status: 'active' } },
      { new: true }
    );
    if (!queue) {
      if (!['active', 'full'].includes(existingQueue.status)) return sendError(res, 'QUEUE_NOT_ACTIVE', 'Queue is not active', 400);
      return sendError(res, 'NO_WAITING_TOKENS', 'No tokens are waiting in this queue', 404);
    }
    const newCurrentToken = queue.currentToken;

    // Mark currently serving/called token as served
    const currentlyServing = await Token.findOneAndUpdate({
      queueId: queue._id,
      status: { $in: ['serving', 'called'] },
    }, {
      status: 'served',
      servedAt: new Date(),
    }, { new: true });
    if (currentlyServing) {
      if (currentlyServing.calledAt) {
        currentlyServing.actualWaitMs = Date.now() - currentlyServing.calledAt.getTime();
        await currentlyServing.save();
      }
    }

    // Find next real Token document (real users in queue)
    const nextToken = await Token.findOneAndUpdate({
      queueId: queue._id,
      status: 'waiting',
    }, {
      status: 'called',
      calledAt: new Date(),
    }, { new: true }).sort({ tokenNumber: 1 });

    if (nextToken) {
      // Real user — mark their token as called and notify them
      const io = req.app.get('io');
      if (io) {
        emitToUser(io, String(nextToken.userId), 'token:called', {
          queueId: req.params.id,
          tokenNumber: nextToken.tokenNumber,
          message: `Your token #${nextToken.tokenNumber} is being called! Please proceed.`,
        });
      }

      // SMS notification (no-op if TWILIO_PHONE not configured)
      try {
        const user = await User.findById(nextToken.userId).select('phone name').lean();
        if (user?.phone) {
          // Normalise to E.164 for Indian numbers (+91)
          const e164 = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
          notifyTokenCalled(e164, nextToken.tokenNumber, queue.name, queue.organizationId?.name || 'CrowdQueue');
        }
      } catch (smsErr) {
        // Never let SMS failure break the call-next flow
        require('../utils/logger').warn(`SMS lookup failed: ${smsErr.message}`);
      }
    }

    // Advance the counter regardless (works for both real and seeded data)
    await invalidateQueueCache(req.params.id);
    const newState = await getQueueState(req.params.id);

    // Broadcast live state to all watching clients
    const io = req.app.get('io');
    if (io) {
      emitQueueUpdate(io, req.params.id, 'queue:state_update', newState);
    }

    sendSuccess(res, {
      calledToken: newCurrentToken,
      hasRealUser: !!nextToken,
      userId: nextToken?.userId || null,
      queueState: newState,
    }, `Now calling token #${newCurrentToken}`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createQueue, getQueueById, getMyQueues, updateQueue, updateQueueStatus, deleteQueue, callNext,
  updateQueueSchema, statusSchema,
};
