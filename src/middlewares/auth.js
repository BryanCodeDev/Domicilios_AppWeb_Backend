const jwt = require('jsonwebtoken');
const AppErrorModule = require('../utils/AppError');
const AppError = AppErrorModule.AppError || AppErrorModule;

const authenticate = (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  if (!tokenHeader) {
    throw new AppError('No token, authorization denied', 401);
  }
  const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7) : tokenHeader;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    throw new AppError('Token is not valid', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }
    if (!roles.includes(req.user.rol)) {
      throw new AppError('No tienes permiso para acceder a este recurso', 403);
    }
    next();
  };
};

const optionalAuth = (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  if (!tokenHeader) {
    return next();
  }
  const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7) : tokenHeader;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
