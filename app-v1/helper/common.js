module.exports = {
  async getUserSessionIdOrDefault() {
    try {
      const req = global.currentRequest;
      // Prefer explicit header if provided
      if (req && req.headers && req.headers['x-session-id']) {
        return String(req.headers['x-session-id']);
      }
      // Fallback to express-session if available
      if (req && req.session && req.session.id) {
        return String(req.session.id);
      }
    } catch (_) {
      // ignore
    }
    return null;
  }
};

