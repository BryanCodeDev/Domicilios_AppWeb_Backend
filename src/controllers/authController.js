const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Business, RiderProfile } = require('../models');
const { validate, schemas } = require('../middlewares/validate');
const { AppError, asyncHandler } = require('../utils/AppError');

const generateToken = (user) => {
  const payload = { user: { id: user.id, rol: user.rol, email: user.email } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
  const payload = { id: user.id, token: bcrypt.randomBytes(32).toString('hex') };
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
  res.status(201).json({ success: true, token, refreshToken, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('Credenciales inválidas', 401);
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Credenciales inválidas', 401);
  if (!user.activo) throw new AppError('Usuario inactivo. Contacte al administrador', 403);
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
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
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token requerido', 401);
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    const token = generateToken(user);
    res.json({ success: true, token });
  } catch (err) {
    throw new AppError('Refresh token inválido', 401);
  }
});

const registerFcmToken = asyncHandler(async (req, res) => {
  const { fcm_token } = req.body;
  await User.update({ fcm_token }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'FCM token registrado' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.json({ success: true, message: 'Si el email existe, se envió un correo de recuperación' });
  const resetToken = bcrypt.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000);
  await user.update({ reset_token: resetToken, reset_token_expiry: resetTokenExpiry });
  console.log(`Password reset token for ${email}: ${resetToken}`);
  res.json({ success: true, message: 'Si el email existe, se envió un correo de recuperación' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
   const { Op } = require('sequelize');
  const user = await User.findOne({ where: { reset_token: token, reset_token_expiry: { [Op.gt]: new Date() } } });
  if (!user) throw new AppError('Token inválido o expirado', 400);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await user.update({ password_hash: passwordHash, reset_token: null, reset_token_expiry: null });
  res.json({ success: true, message: 'Contraseña actualizada' });
});

module.exports = { register, login, getProfile, refreshToken, registerFcmToken, forgotPassword, resetPassword };
