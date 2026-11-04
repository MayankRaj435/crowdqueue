const { getQueueState } = require('../services/queue.service');
const logger = require('../utils/logger');
const Queue = require('../models/Queue.model');

const registerQueueHandlers = (io, socket) => {
  socket.on('join_queue_room', async ({ queueId }) => {
    socket.join(`queue:${queueId}`);
    logger.debug(`User ${socket.data.userId} joined queue room ${queueId}`);

    const state = await getQueueState(queueId);
    if (state) {
      socket.emit('queue:state_update', state);
    }
  });

  socket.on('leave_queue_room', ({ queueId }) => {
    socket.leave(`queue:${queueId}`);
    logger.debug(`User ${socket.data.userId} left queue room ${queueId}`);
  });

  socket.on('join_staff_room', async ({ queueId }) => {
    if (socket.data.role === 'super_admin') {
      socket.join(`staff:${queueId}`);
      return;
    }
    if (socket.data.role === 'staff' || socket.data.role === 'org_admin') {
      try {
        const queue = await Queue.findById(queueId).select('organizationId').lean();
        if (queue && String(queue.organizationId) === socket.data.organizationId) {
          socket.join(`staff:${queueId}`);
        }
      } catch (err) {
        logger.warn(`Staff room join denied: ${err.message}`);
      }
    }
  });
};

const emitQueueUpdate = (io, queueId, event, data) => {
  io.to(`queue:${queueId}`).emit(event, data);
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToStaff = (io, queueId, event, data) => {
  io.to(`staff:${queueId}`).emit(event, data);
};

module.exports = { registerQueueHandlers, emitQueueUpdate, emitToUser, emitToStaff };
