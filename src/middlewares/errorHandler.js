const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors?.map(e => e.message) || [err.message];
    return res.status(400).json({ success: false, message: 'Validation error: ' + messages.join(', ') });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'Duplicate entry' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;

