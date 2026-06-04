const { User, Business, Order, Rating, Commission } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');

const getDashboardStats = asyncHandler(async (req, res) => {
  let totalUsers = 0, totalBusinesses = 0, totalOrders = 0, totalRevenue = 0, pendingOrders = 0, pendingCommissions = 0;
  try { totalUsers = await User.count({ where: { activo: true } }); } catch (e) { console.warn('User.count error:', e.message); }
  try { totalBusinesses = await Business.count({ where: { activo: true } }); } catch (e) { console.warn('Business.count error:', e.message); }
  try { totalOrders = await Order.count(); } catch (e) { console.warn('Order.count error:', e.message); }
  try { totalRevenue = (await Order.sum('total', { where: { estado: 'DELIVERED' } })) || 0; } catch (e) { console.warn('Order.sum error:', e.message); }
  try { pendingOrders = await Order.count({ where: { estado: 'PENDING' } }); } catch (e) { console.warn('Order.count PENDING error:', e.message); }
  try { pendingCommissions = (await Commission.sum('monto_negocio', { where: { estado: 'PENDIENTE' } })) || 0; } catch (e) { console.warn('Commission.sum error:', e.message); }
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
  res.json({ user: { id: user.id, activo: user.activo } });
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
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
  } catch (err) {
    console.error('getAllOrders error:', err.message, err.stack);
    res.status(500).json({ message: 'Error al obtener pedidos', error: err.message });
  }
});

module.exports = { getDashboardStats, getAllUsers, updateUserStatus, getAllOrders };
