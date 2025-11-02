const express = require('express');
// Load models and wire associations centrally via dbRelation pattern
const dbRelation = require('./models/dbRelation');
dbRelation();

const authRouter = require('./routes/auth'); 
// Register event listeners once on app init
require('./listeners/userListeners');

class AppInitializer {
  constructor() {
    // Initialize any dependencies here
  }

  initialize(app) {
    this.setupRoutes(app);
  }

  setupRoutes(app) {
    // Mount the auth router
    app.use('/auth', authRouter);
  }
}

// Export a singleton instance
module.exports = new AppInitializer();
