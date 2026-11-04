const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User.model');

const authSocketMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('role organizationId isActive').lean();
    if (!user || !user.isActive) return next(new Error('Invalid user'));
    socket.data.userId = decoded.userId;
    socket.data.role = user.role;
    socket.data.organizationId = user.organizationId ? String(user.organizationId) : null;
    next();
  } catch (err) {
    logger.warn('Socket auth failed', err.message);
    next(new Error('Invalid token'));
  }
};

module.exports = { authSocketMiddleware };
