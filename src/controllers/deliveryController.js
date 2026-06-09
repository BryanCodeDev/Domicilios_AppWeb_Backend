const { Delivery, Order, RiderProfile, Business, User, Op } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');

const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined) throw new AppError('Ubicacion requerida', 400);
  const profile = await RiderProfile.findOne({ where: { user_id: req.user.id } });
  if (!profile) throw new AppError('Perfil de repartidor no encontrado', 404);
  await profile.update({ lat_actual: lat, lng_actual: lng });
  const delivery = await Delivery.findOne({ where: { repartidor_id: req.user.id, estado: { [Op.not]: 'completed' } } });
  if (delivery) {
    await delivery.update({ lat_actual: lat, lng_actual: lng });
    const io = req.app.get('io');
    if (io) {
      io.to('order:' + delivery.order_id).emit('rider_location_updated', { orderId: delivery.order_id, lat, lng });
    }
  }
  res.json({ message: 'Ubicacion actualizada' });
});

const acceptDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const delivery = await Delivery.findOne({ where: { order_id: orderId, estado: 'assigned' } });
  if (!delivery) throw new AppError('Entrega no encontrada o ya aceptada', 404);
  if (String(delivery.repartidor_id) !== String(req.user.id)) throw new AppError('No autorizado', 403);
  await delivery.update({ estado: 'picked_up' });
  const order = await Order.findByPk(orderId);
  await order.update({ estado: 'PICKED_UP', repartidor_id: req.user.id });
  const io = req.app.get('io');
  if (io) {
    io.to('order:' + orderId).emit('order_status_changed', { orderId, estado: 'PICKED_UP' });
  }
  res.json({ delivery });
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { estado } = req.body;
  const delivery = await Delivery.findOne({ where: { order_id: orderId, repartidor_id: req.user.id } });
  if (!delivery) throw new AppError('Entrega no encontrada', 404);
  await delivery.update({ estado });
  const order = await Order.findByPk(orderId);
  if (estado === 'delivered') {
    await order.update({ estado: 'DELIVERED' });
    await createCommission(order);
  }
  const io = req.app.get('io');
  if (io) {
    io.to('order:' + orderId).emit('order_status_changed', { orderId, estado: order.estado });
  }
  res.json({ delivery });
});

const createCommission = async (order) => {
  const total = Number(order.total);
  const { Commission } = require('../models');
  await Commission.create({ 
    order_id: order.id, 
    business_id: order.business_id, 
    repartidor_id: order.repartidor_id, 
    porcentaje_neg: 15, 
    porcentaje_rep: 10, 
    monto_negocio: total * 0.15, 
    monto_repartidor: total * 0.10, 
    estado: 'PENDIENTE' 
  });
};

const getActiveDelivery = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.findAll({ where: { repartidor_id: req.user.id, estado: { [Op.not]: 'completed' } }, include: [{ model: Order, as: 'order', include: [{ model: Business, as: 'business', include: [{ model: User, as: 'user', attributes: ['nombre'] }] }, { model: User, as: 'client', attributes: ['nombre', 'phone'] }] }] });
  res.json({ delivery: deliveries[0] || null });
});

module.exports = { updateLocation, acceptDelivery, updateDeliveryStatus, getActiveDelivery };

