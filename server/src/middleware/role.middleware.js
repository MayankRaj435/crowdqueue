const { sendError } = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'FORBIDDEN', 'You do not have permission to perform this action', 403);
    }

    if (req.user.role === 'staff' || req.user.role === 'org_admin') {
      if (req.params.orgId && req.params.orgId !== String(req.user.organizationId)) {
        return sendError(res, 'ORG_MISMATCH', 'Access denied to this organization', 403);
      }
    }

    next();
  };
};

module.exports = { authorize };
