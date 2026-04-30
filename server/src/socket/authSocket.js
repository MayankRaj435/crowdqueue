const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authSocketMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;
    next();
  } catch (err) {
    logger.warn('Socket auth failed', err.message);
    next(new Error('Invalid token'));
  }
};

module.exports = { authSocketMiddleware };
