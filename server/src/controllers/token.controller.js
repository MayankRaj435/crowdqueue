const Token = require('../models/Token.model');
const Queue = require('../models/Queue.model');
const { issueToken, cancelToken } = require('../services/token.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { emitQueueUpdate, emitToStaff } = require('../socket/queueSocket');

const joinQueue = async (req, res, next) => {
  try {
    const { queueId } = req.params;

    const existingToken = await Token.findOne({
      queueId,
      userId: req.user.userId,
      status: { $in: ['waiting', 'called'] },
    }).lean();

    if (existingToken) {
      return sendError(res, 'ALREADY_IN_QUEUE', 'You already have an active token in this queue', 409);
    }

    const queue = await Queue.findById(queueId).populate('organizationId', 'name').lean();
    if (!queue) {
      return sendError(res, 'QUEUE_NOT_FOUND', 'Queue not found', 404);
    }

    const result = await issueToken(queueId, req.user.userId, queue.organizationId._id || queue.organizationId);

    const io = req.app.get('io');
    if (io) {
      emitQueueUpdate(io, queueId, 'queue:state_update', {
        currentToken: queue.currentToken,
        lastTokenIssued: result.token.tokenNumber,
        waiting: result.position,
      });
      emitToStaff(io, queueId, 'queue:new_join', {
        tokenNumber: result.token.tokenNumber,
        totalWaiting: result.position,
      });
    }

    sendSuccess(res, {
      token: {
        id: result.token._id,
        tokenNumber: result.token.tokenNumber,
        queueName: result.queueName,
        position: result.position,
        estimatedWaitMs: result.token.estimatedWaitMs,
        status: result.token.status,
      },
    }, 'Queue joined successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getMyTokens = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user.userId };

    if (status === 'active') {
      filter.status = { $in: ['waiting', 'called', 'serving'] };
    } else if (status === 'past') {
      filter.status = { $in: ['served', 'cancelled', 'expired', 'no_show', 'skipped'] };
    }

    const tokens = await Token.find(filter)
      .populate('queueId', 'name currentToken avgServiceTimeMs')
      .populate('organizationId', 'name type')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const enriched = tokens.map((t) => {
      const queue = t.queueId;
      const tokensAhead = queue ? Math.max(0, t.tokenNumber - queue.currentToken - 1) : 0;
      return { ...t, tokensAhead };
    });

    sendSuccess(res, { tokens: enriched });
  } catch (err) {
    next(err);
  }
};

const getTokenById = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('queueId', 'name currentToken avgServiceTimeMs organizationId')
      .populate('organizationId', 'name type address')
      .lean();

    if (!token) return sendError(res, 'TOKEN_NOT_FOUND', 'Token not found', 404);
    sendSuccess(res, { token });
  } catch (err) {
    next(err);
  }
};

const cancelTokenHandler = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const token = await cancelToken(req.params.id, req.user.userId, reason);

    const io = req.app.get('io');
    if (io) {
      emitQueueUpdate(io, token.queueId, 'queue:state_update', { type: 'token_cancelled' });
    }

    sendSuccess(res, { token }, 'Token cancelled');
  } catch (err) {
    next(err);
  }
};

const rateToken = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'INVALID_RATING', 'Rating must be between 1 and 5', 400);
    }

    const token = await Token.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId, status: 'served' },
      { rating, feedback: feedback || '' },
      { new: true }
    );

    if (!token) return sendError(res, 'TOKEN_NOT_FOUND', 'Token not found or not yet served', 404);
    sendSuccess(res, { token }, 'Rating submitted');
  } catch (err) {
    next(err);
  }
};

module.exports = { joinQueue, getMyTokens, getTokenById, cancelToken: cancelTokenHandler, rateToken };
