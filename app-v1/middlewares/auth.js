const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/errors/ApiError');
const UserRepository = require('../repositories/UserRepository');
const { getPermissionsForUser, hasAllPermissions, hasAnyPermission } = require('../utils/permissions');

// Extracts Bearer token from Authorization header
function extractToken(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth) return null;
  const [scheme, token] = String(auth).split(' ');
  if (/^Bearer$/i.test(scheme) && token) return token.trim();
  return null;
}

// Authenticate JWT, load user, attach to req.auth
async function authenticate(req, _res, next) {
  try {
    const token = extractToken(req) || req.query.token || null;
    if (!token) throw new ApiError(401, 'Unauthorized');

    let claims;
    try {
      claims = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch (e) {
      throw new ApiError(401, 'Invalid token');
    }

    const repo = new UserRepository();
    const user = await repo.findById(claims.id);
    if (!user) throw new ApiError(401, 'User not found');
    if (user.status && user.status !== 'active') {
      throw new ApiError(403, 'User inactive');
    }

    const permissions = getPermissionsForUser(user);

    req.auth = {
      token,
      claims,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        permissions,
        status: user.status,
        last_login: user.last_login,
      },
    };
    next();
  } catch (err) {
    next(err);
  }
}

// Authorize by roles (like Laravel's middleware parameters: role:admin,editor)
function authorize(...roles) {
  const allowed = Array.isArray(roles[0]) ? roles[0] : roles; // support authorize(['admin','editor'])
  return (req, _res, next) => {
    try {
      if (!req.auth || !req.auth.user) throw new ApiError(401, 'Unauthorized');
      if (!allowed || allowed.length === 0) return next();
      const userRole = req.auth.user.role;
      if (!userRole) throw new ApiError(403, 'Forbidden');
      if (!allowed.includes(userRole)) throw new ApiError(403, 'Forbidden');
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Authorize by permissions (all-of)
function authorizePermission(...perms) {
  const required = Array.isArray(perms[0]) ? perms[0] : perms; // support array or spread
  return (req, _res, next) => {
    try {
      if (!req.auth || !req.auth.user) throw new ApiError(401, 'Unauthorized');
      if (!required || required.length === 0) return next();
      const userPerms = req.auth.user.permissions || [];
      if (!hasAllPermissions(userPerms, required)) throw new ApiError(403, 'Forbidden');
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Authorize by permissions (any-of)
function authorizeAnyPermission(...perms) {
  const required = Array.isArray(perms[0]) ? perms[0] : perms;
  return (req, _res, next) => {
    try {
      if (!req.auth || !req.auth.user) throw new ApiError(401, 'Unauthorized');
      if (!required || required.length === 0) return next();
      const userPerms = req.auth.user.permissions || [];
      if (!hasAnyPermission(userPerms, required)) throw new ApiError(403, 'Forbidden');
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authenticate, authorize, authorizePermission, authorizeAnyPermission };
