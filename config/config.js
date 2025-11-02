const path = require('path');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.environments = {
      development: this.getDevelopmentConfig(),
      test: this.getTestConfig(),
      production: this.getProductionConfig()
    };
  }

  getDevelopmentConfig() {
    return {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      migrationStoragePath: path.join(__dirname, '..', 'app-v1', 'migrations'),
      logging: console.log // Optional: enable logging in development
    };
  }

  getTestConfig() {
    return {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'postgres',
      migrationStoragePath: path.join(__dirname, '..', 'app-v1', 'migrations'),
      logging: false // Typically disable logging in tests
    };
  }

  getProductionConfig() {
    return {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || 'your_production_database',
      host: process.env.DB_HOST,
      dialect: 'postgres',
      migrationStoragePath: path.join(__dirname, '..', 'app-v1', 'migrations'),
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: false // Typically disable logging in production
    };
  }

  getConfig(env) {
    return this.environments[env] || this.environments.development;
  }
}

module.exports = new DatabaseConfig();
