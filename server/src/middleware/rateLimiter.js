const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: message || 'Too many requests, please try again later',
        statusCode: 429,
      },
    },
  });
};

const generalLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests');
const authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many auth attempts');
const joinQueueLimiter = createLimiter(60 * 1000, 5, 'Too many queue join attempts');

module.exports = { generalLimiter, authLimiter, joinQueueLimiter };
