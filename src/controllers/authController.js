const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Business, RiderProfile } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');
const logger = require('../utils/logger');

const generateToken = (user) => {
  const payload = { user: { id: user.id, rol: user.rol, email: user.email } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
  const crypto = require('crypto');
  const payload = { id: user.id, token: crypto.randomBytes(32).toString('hex') };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const register = asyncHandler(async (req, res) => {
  const { nombre, email, password, rol, phone } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new AppError('Ya existe un usuario con ese email', 400);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ nombre, email, password_hash: passwordHash, rol, phone: phone || null });
  if (rol === 'negocio') {
    await Business.create({ user_id: user.id, nombre, categoria: 'General', direccion: '' });
  }
  if (rol === 'repartidor') {
    await RiderProfile.create({ user_id: user.id });
  }
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  logger.info({ message: 'User registered', userId: user.id, email });
  res.status(201).json({ success: true, token, refreshToken, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('Credenciales invalidas', 401);
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Credenciales invalidas', 401);
  if (!user.activo) throw new AppError('Usuario inactivo. Contacte al administrador', 403);
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  logger.info({ message: 'User logged in', userId: user.id });
  res.json({ success: true, token, refreshToken, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { model: Business, as: 'business' },
      { model: RiderProfile, as: 'riderProfile' }
    ]
  });
  res.json({ success: true, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, phone: user.phone, avatar_url: user.avatar_url, business: user.business, riderProfile: user.riderProfile } });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: refresh } = req.body;
  if (!refresh) throw new AppError('Refresh token requerido', 401);
  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    const token = generateToken(user);
    res.json({ success: true, token });
  } catch {
    throw new AppError('Refresh token invalido', 401);
  }
});

const registerFcmToken = asyncHandler(async (req, res) => {
  const { fcm_token } = req.body;
  if (fcm_token && fcm_token.length > 500) {
    throw new AppError('FCM token demasiado largo', 400);
  }
  await User.update({ fcm_token }, { where: { id: req.user.id } });
  logger.info({ message: 'FCM token updated', userId: req.user.id });
  res.json({ success: true, message: 'FCM token registrado' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.json({ success: true, message: 'Si el email existe, se envio un correo de recuperacion' });
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.update({ reset_token: resetToken, reset_token_expiry: resetTokenExpiry });
  logger.info({ message: 'Password reset requested', email });
  res.json({ success: true, message: 'Si el email existe, se envio un correo de recuperacion' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const { Op } = require('sequelize');
  const user = await User.findOne({ where: { reset_token: token, reset_token_expiry: { [Op.gt]: new Date() } } });
  if (!user) throw new AppError('Token invalido o expirado', 400);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await user.update({ password_hash: passwordHash, reset_token: null, reset_token_expiry: null });
  logger.info({ message: 'Password reset successful', userId: user.id });
  res.json({ success: true, message: 'Contrasena actualizada' });
});

module.exports = { register, login, getProfile, refreshToken, registerFcmToken, forgotPassword, resetPassword };

