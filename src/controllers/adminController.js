const { User, Business, Order, Rating, Commission } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.count({ where: { activo: true } });
  const totalBusinesses = await Business.count({ where: { activo: true } });
  const totalOrders = await Order.count();
  const totalRevenue = await Order.sum('total', { where: { estado: 'DELIVERED' } });
  const pendingOrders = await Order.count({ where: { estado: 'PENDING' } });
  const pendingCommissions = await Commission.sum('monto_negocio', { where: { estado: 'PENDIENTE' } });
  res.json({ stats: { totalUsers, totalBusinesses, totalOrders, totalRevenue: totalRevenue || 0, pendingOrders, pendingCommissions: pendingCommissions || 0 } });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { rol, activo } = req.query;
  const where = {};
  if (rol) where.rol = rol;
  if (activo !== undefined) where.activo = activo === 'true';
  const users = await User.findAll({ where, attributes: ['id', 'nombre', 'email', 'rol', 'phone', 'activo', 'created_at'], order: [['created_at', 'DESC']] });
  res.json({ users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  const user = await User.findByPk(id);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  await user.update({ activo });
  res.json({ user: { id: user.id, activo: user.activo } });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const where = {};
  if (estado) where.estado = estado;
  const orders = await Order.findAll({ where, include: [{ model: require('../models').User, as: 'client', attributes: ['nombre', 'email'] }, { model: require('../models').Business, as: 'business', include: [{ model: require('../models').User, as: 'user', attributes: ['nombre'] }] }, { model: require('../models').User, as: 'rider', attributes: ['nombre'] }], order: [['created_at', 'DESC']], limit: 100 });
  res.json({ orders });
});

module.exports = { getDashboardStats, getAllUsers, updateUserStatus, getAllOrders };
