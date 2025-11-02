const { Sequelize } = require('sequelize');
require('dotenv').config();

class Database {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('Database connection established');
      return this.sequelize;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.sequelize.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing connection:', error);
      throw error;
    }
  }

  getConnection() {
    return this.sequelize;
  }
}

// Create and export single instance
const db = new Database();

// Optional: Add shutdown handlers
process.on('SIGINT', async () => {
  await db.close();
  process.exit(0);
});

module.exports = db;