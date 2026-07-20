const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { authSocketMiddleware } = require('./authSocket');
const { registerQueueHandlers } = require('./queueSocket');
const logger = require('../utils/logger');
const { parseAllowedOrigins, isOriginAllowed } = require('../utils/origins');

const initSocket = (httpServer, redisClient) => {
  const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_URL);

  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin, allowedOrigins)) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
    },
    pingTimeout: 60000,
    transports: ['websocket', 'polling'],
  });

  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();

  Promise.all([pubClient.connect && pubClient, subClient.connect && subClient])
    .then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.io Redis adapter initialized');
    })
    .catch((err) => {
      logger.warn('Socket.io running without Redis adapter', err.message);
    });

  io.use(authSocketMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    logger.debug(`Socket connected: user ${userId}`);

    registerQueueHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: user ${userId}`);
    });
  });

  return io;
};

module.exports = { initSocket };
