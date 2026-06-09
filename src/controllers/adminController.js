const { User, Business, Order, Commission } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');
const logger = require('../utils/logger');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBusinesses, totalOrders, totalRevenue, pendingOrders, pendingCommissions] = await Promise.all([
    User.count({ where: { activo: true } }).catch(() => 0),
    Business.count({ where: { activo: true } }).catch(() => 0),
    Order.count().catch(() => 0),
    Order.sum('total', { where: { estado: 'DELIVERED' } }).catch(() => 0),
    Order.count({ where: { estado: 'PENDING' } }).catch(() => 0),
    Commission.sum('monto_negocio', { where: { estado: 'PENDIENTE' } }).catch(() => 0)
  ]);
  
  logger.info({ message: 'Dashboard stats fetched', adminId: req.user?.id });
  
  res.json({ stats: { totalUsers, totalBusinesses, totalOrders, totalRevenue, pendingOrders, pendingCommissions } });
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
  logger.info({ message: 'User status updated', userId: id, adminId: req.user.id });
  res.json({ user: { id: user.id, activo: user.activo } });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const where = {};
  if (estado) where.estado = estado;
  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'client', attributes: ['id', 'nombre', 'email'] },
      { model: Business, as: 'business', include: [{ model: User, as: 'user', attributes: ['id', 'nombre'] }] },
      { model: User, as: 'rider', attributes: ['id', 'nombre'] }
    ],
    order: [['created_at', 'DESC']],
    limit: 100
  });
  res.json({ orders });
});

module.exports = { getDashboardStats, getAllUsers, updateUserStatus, getAllOrders };

