const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../uploads/logs');
    this.ensureLogDirectoryExists();
    this.logger = this.createWinstonLogger();
  }

  ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogFormat() {
    return printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} ${level}: ${stack || message}`;
    });
  }

  createWinstonLogger() {
    return createLogger({
      level: process.env.LOG_LEVEL || 'error',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        this.getLogFormat()
      ),
      transports: this.getTransports(),
      exceptionHandlers: this.getExceptionHandlers(),
      rejectionHandlers: this.getRejectionHandlers()
    });
  }

  getTransports() {
    return [
      new DailyRotateFile({
        filename: path.join(this.logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: process.env.MAX_LOG_SIZE || '20m',
        maxFiles: process.env.LOG_RETENTION || '14d',
        zippedArchive: true,
        level: 'error'
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(),
          this.getLogFormat()
        )
      })
    ];
  }

  getExceptionHandlers() {
    return [
      new DailyRotateFile({
        filename: path.join(this.logDir, 'exceptions-%DATE%.log'),
        datePattern: 'YYYY-MM-DD'
      })
    ];
  }

  getRejectionHandlers() {
    return [
      new DailyRotateFile({
        filename: path.join(this.logDir, 'rejections-%DATE%.log'),
        datePattern: 'YYYY-MM-DD'
      })
    ];
  }

  // Proxy methods for standard log levels
  error(message, meta) {
    this.logger.error(message, meta);
  }

  warn(message, meta) {
    this.logger.warn(message, meta);
  }

  info(message, meta) {
    this.logger.info(message, meta);
  }

  debug(message, meta) {
    this.logger.debug(message, meta);
  }

  verbose(message, meta) {
    this.logger.verbose(message, meta);
  }

  // Custom logging methods
  logError(error, context = {}) {
    this.error({
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  logRequest(req) {
    this.info('Incoming request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      headers: req.headers
    });
  }

  logResponse(res, responseTime) {
    this.info('Outgoing response', {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`
    });
  }
}

// Singleton instance
module.exports = new Logger();