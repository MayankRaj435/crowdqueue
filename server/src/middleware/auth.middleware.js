const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendError } = require('../utils/apiResponse');

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

module.exports = { authenticate };
