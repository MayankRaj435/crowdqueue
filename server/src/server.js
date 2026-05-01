require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { redisClient } = require('./config/redis');
const { initSocket } = require('./socket');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await redisClient.ping();
  logger.info('Redis connected');

  const server = http.createServer(app);
  const io = initSocket(server, redisClient);

  app.set('io', io);

  server.listen(PORT, () => {
    logger.info(`CrowdQueue API running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
