const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/errors/ApiError');
const UserRepository = require('../repositories/UserRepository');
const bus = require('../../utils/events/bus');
const usersEvents = require('../classes/users/usersEvents');
const { getPermissionsForUser } = require('../utils/permissions');

class UserService {
  async login(email, password) {
    const sanitizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const sanitizedPassword = typeof password === 'string' ? password.trim() : '';

    if (!sanitizedEmail || !sanitizedPassword) {
      throw new ApiError(400, 'Email and password are required');
    }

    bus.emit(usersEvents.BEFORE_LOGIN, { email: sanitizedEmail });

    let success = false;
    let userId = null;
    const repo = new UserRepository();
    try {
      const user = await repo.findByEmail(sanitizedEmail);
      if (!user) {
        bus.emit(usersEvents.LOGIN_FAILED, { email: sanitizedEmail, reason: 'user_not_found' });
        throw new ApiError(401, 'Invalid credentials');
      }

      const ok = await bcrypt.compare(sanitizedPassword, user.password || '');
      if (!ok) {
        bus.emit(usersEvents.LOGIN_FAILED, { email: sanitizedEmail, reason: 'bad_password' });
        throw new ApiError(401, 'Invalid credentials');
      }

      await repo.updateLastLogin(user);
      userId = user.id;

      const permissions = getPermissionsForUser(user);
      const roleSlugs = Array.from(new Set((user.roles || []).map(r => r.slug).filter(Boolean)));
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, permissions },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      success = true;
      bus.emit(usersEvents.ON_LOGIN, { userId: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          permissions,
          roles: roleSlugs,
          status: user.status,
          last_login: user.last_login,
        },
      };
    } finally {
      bus.emit(usersEvents.AFTER_LOGIN, { email: sanitizedEmail, success, userId });
    }
  }
}

module.exports = new UserService();
