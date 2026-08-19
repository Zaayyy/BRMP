const config = require('../config/env');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
