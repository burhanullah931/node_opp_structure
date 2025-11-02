require("dotenv").config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require('path');
const database = require('./config/database');
const ApiError = require('./utils/errors/ApiError');
const ApiResponse = require("./utils/responses/ApiResponse");
const logger = require('./config/logger');

class AppServer {
  constructor() {
    this.app = express();
    this.httpPort = process.env.HTTP_PORT || 80;
    this.httpsPort = process.env.HTTPS_PORT || 443;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandlers();
    this.initializeServers();
    this.setupProcessHandlers();
  }

  initializeMiddlewares() {
    // Security headers
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, application/json, text/plain');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0');
      next();
    });

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    this.app.use(express.static(path.join(__dirname, 'uploads')));
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Session
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
      })
    );

    // Passport
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // Other middlewares
    this.app.use(cors());
    this.app.use(morgan('tiny'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // Global request middleware
    require('./middlewares/globalRequestMiddleware')(this.app);
  }

  initializeRoutes() {

    const v1Router = express.Router();
    const appV1Initializer = require('./app-v1/app');
    appV1Initializer.initialize(v1Router);
    this.app.use('/api/v1', v1Router);

    // const v2Router = express.Router();
    // const appV2Initializer = require('./app-v2/app');
    // appV2Initializer.initialize(v2Router);
    // this.app.use('/api/v2', v2Router);

    // Default route
    this.app.get('/', (req, res) => {
      res.send("App is running");
    });
  }

  initializeErrorHandlers() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).send('404 Not Found');
    });

    // Error handler
    // this.app.use((err, req, res, next) => {
    //   console.error(err.stack);
    //   res.status(500).send('Something broke!');
    // });
    // Global error handler
    this.app.use((err, req, res, next) => {
        err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        
        new ApiResponse(res, err.statusCode, null, err.message).send();

        // res.status(err.statusCode).json({
        //   success: false,
        //   status: err.statusCode,
        //   message: err.message,
        //   data : null
        // });
      });
  }

  initializeServers() {
    // Initialize HTTP server always; HTTPS only if certs are configured
    this.httpServer = http.createServer(this.app);

    const sslKeyPath = process.env.SSL_KEY || null;
    const sslCertPath = process.env.SSL_CERT || process.env.SSL_CRT || null;

    try {
      if (sslKeyPath && sslCertPath) {
        const options = {
          key: fs.readFileSync(sslKeyPath),
          cert: fs.readFileSync(sslCertPath),
        };
        this.httpsServer = https.createServer(options, this.app);
      } else if (!sslKeyPath && sslCertPath) {
        // Try to parse combined PEM file containing both key and cert
        const pem = fs.readFileSync(sslCertPath, 'utf8');
        const keyMatch = pem.match(/-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/);
        const certMatch = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
        if (keyMatch && certMatch) {
          const options = { key: keyMatch[0], cert: certMatch[0] };
          this.httpsServer = https.createServer(options, this.app);
        } else {
          console.warn('SSL configured via SSL_CRT but key/cert blocks not found; starting HTTP only.');
        }
      } else {
        console.warn('SSL not configured (SSL_KEY/SSL_CERT or SSL_CRT missing); starting HTTP only.');
      }
    } catch (e) {
      console.error('Error initializing HTTPS; continuing with HTTP only:', e.message);
      this.httpsServer = undefined;
    }
  }

  setupProcessHandlers() {
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  }

  start() {
    this.httpServer.listen(this.httpPort, () => {
      console.log(`HTTP server listening on port ${this.httpPort}`);
    });

    if (this.httpsServer) {
      this.httpsServer.listen(this.httpsPort, () => {
        console.log(`HTTPS server listening on port ${this.httpsPort}`);
      });
    }
  }

  stop() {
    if (this.httpServer) {
      this.httpServer.close();
    }
    if (this.httpsServer) {
      this.httpsServer.close();
    }
  }
}

// Create and start the server
const server = new AppServer();

database.connect()
  .then(() => {
    server.start();
  })
  .catch((err) => {
    console.error('Unable to start server due to DB connection error:', err);
    if (String(process.env.NODE_ENV).toLowerCase() === 'development') {
      console.warn('Continuing to start HTTP/HTTPS servers in development mode without DB connection.');
      server.start();
    } else {
      process.exit(1);
    }
  });

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  server.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});

module.exports = server;
