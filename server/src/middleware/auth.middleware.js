const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendError } = require('../utils/apiResponse');

const validateJwtSecrets = () => {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((name) => !process.env[name] || process.env[name].length < 32);
  if (missing.length) {
    throw new Error(`Missing or weak JWT secret(s): ${missing.join(', ')}`);
  }
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select('name phone role organizationId isActive trustScore')
      .lean();

    if (!user || !user.isActive) {
      return sendError(res, 'USER_INACTIVE', 'Account is deactivated', 401);
    }

    req.user = {
      userId: decoded.userId,
      name: user.name,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId,
      trustScore: user.trustScore,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'TOKEN_EXPIRED', 'Access token expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'INVALID_TOKEN', 'Invalid access token', 401);
    }
    next(err);
  }
};

module.exports = { authenticate, validateJwtSecrets };
