const bus = require('../../utils/events/bus');
const logger = require('../../config/logger');
const usersEvents = require('../classes/users/usersEvents');

// Attach domain event listeners once at boot
bus.on(usersEvents.BEFORE_LOGIN, (payload) => {
  try {
    logger.info(`BEFORE_LOGIN: ${payload?.email ?? ''}`);
  } catch (_) {}
});

bus.on(usersEvents.ON_LOGIN, (payload) => {
  try {
    logger.info('ON_LOGIN', { userId: payload?.userId, email: payload?.email });
  } catch (_) {}
});

bus.on(usersEvents.LOGIN_FAILED, (payload) => {
  try {
    logger.warn('LOGIN_FAILED', { email: payload?.email, reason: payload?.reason });
  } catch (_) {}
});

bus.on(usersEvents.AFTER_LOGIN, (payload) => {
  try {
    logger.info('AFTER_LOGIN', { email: payload?.email, success: payload?.success, userId: payload?.userId || null });
  } catch (_) {}
});

