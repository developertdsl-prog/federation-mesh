const logger = require('../utils/logger');

/**
 * Centralized sanitized error handler for Supergraph Router
 */
function errorHandler(err, req, res, next) {
  logger.error('Unhandled Gateway Error: %s', err.stack || err.message);

  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    errors: [{
      message: isProduction ? 'Internal Supergraph Router Fault' : err.message,
      extensions: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
      },
    }],
  });
}

module.exports = errorHandler;
