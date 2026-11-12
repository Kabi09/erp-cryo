const { hasPermission } = require('../utils/permissions');
const ApiError = require('../utils/apiError');

/**
 * Middleware factory that checks if the authenticated user's role
 * has at least one of the required permissions.
 *
 * @param  {...string} permissions – one or more permission strings
 */
const authorize = (...permissions) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    const { role } = req.user;
    const allowed = permissions.some((perm) => hasPermission(role, perm));

    if (!allowed) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action.')
      );
    }

    next();
  };
};

module.exports = { authorize };
