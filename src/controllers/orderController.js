const { Order, OrderItem, User, Business, Product, Payment, Delivery, Commission, RiderProfile } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');
const logger = require('../utils/logger');

const createOrder = asyncHandler(async (req, res) => {
  const { business_id, items, direccion_entrega, lat_entrega, lng_entrega, notas } = req.body;
  const business = await Business.findByPk(business_id);
  if (!business || !business.activo) throw new AppError('Negocio no disponible', 404);
  
  const transaction = await Order.sequelize.transaction();
  try {
    const products = await Product.findAll({ where: { id: items.map(i => i.product_id) }, transaction });
    if (products.length !== items.length) {
      await transaction.rollback();
      throw new AppError('Uno o mas productos no existen', 400);
    }
    
    let total = 0;
    const orderItemsData = items.map(item => {
      const product = products.find(p => String(p.id) === String(item.product_id));
      if (!product.disponible) {
        transaction.rollback();
        throw new AppError('Producto ' + product.nombre + ' no disponible', 400);
      }
      const subtotal = Number(product.precio) * item.cantidad;
      total += subtotal;
      return { product_id: product.id, cantidad: item.cantidad, precio_unitario: product.precio };
    });
    
    const order = await Order.create({
      cliente_id: req.user.id,
      business_id,
      total,
      direccion_entrega,
      lat_entrega,
      lng_entrega,
      notas
    }, { transaction });
    
    await OrderItem.bulkCreate(orderItemsData.map(oi => ({ ...oi, order_id: order.id })), { transaction });
    
    await Commission.create({
      order_id: order.id,
      business_id: business.id,
      monto_negocio: total * 0.1,
      estado: 'PENDIENTE'
    }, { transaction });
    
    await transaction.commit();
    
    const orderWithItems = await Order.findByPk(order.id, { 
      include: [
        { model: OrderItem, as: 'orderItems' }, 
        { model: Business, as: 'business', include: [{ model: User, as: 'user', attributes: ['id', 'nombre', 'phone'] }] }
      ] 
    });
    
    const io = req.app.get('io');
    if (io) {
      io.to('business:' + business.user_id).emit('order:new', orderWithItems);
    }
    
    logger.info({ message: 'Order created', orderId: order.id, total });
    res.status(201).json({ order: orderWithItems });
  } catch (err) {
    await transaction.rollback();
    logger.error({ message: 'Order creation failed', error: err.message });
    throw err;
  }
});

const acceptOrderByBusiness = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) throw new AppError('No tienes un negocio registrado', 404);
  const order = await Order.findByPk(orderId);
  if (!order || String(order.business_id) !== String(business.id)) throw new AppError('Pedido no encontrado', 404);
  if (order.estado !== 'PENDING') throw new AppError('El pedido no puede aceptarse', 400);
  await order.update({ estado: 'ACCEPTED' });
  const io = req.app.get('io');
  if (io) {
    io.to('order:' + orderId).emit('order_status_changed', { orderId, estado: 'ACCEPTED' });
    await assignRiderIfAvailable(orderId, io);
  }
  res.json({ order });
});

const assignRiderIfAvailable = async (orderId, io) => {
  if (!io) return;
  const order = await Order.findByPk(orderId);
  const riders = await User.findAll({ 
    where: { rol: 'repartidor', activo: true }, 
    include: [{ model: RiderProfile, as: 'riderProfile', where: { disponible: true }, required: true }] 
  });
  if (riders.length === 0) return;
  let nearest = null;
  let minDist = Infinity;
  for (const rider of riders) {
    const profile = rider.riderProfile;
    if (!profile.lat_actual || !profile.lng_actual || !order.lat_entrega || !order.lng_entrega) continue;
    const d = haversine(profile.lat_actual, profile.lng_actual, order.lat_entrega, order.lng_entrega);
    if (d < minDist) { minDist = d; nearest = rider; }
  }
  if (nearest) {
    await order.update({ repartidor_id: nearest.id, estado: 'ASSIGNED' });
    await Delivery.create({ order_id: order.id, repartidor_id: nearest.id, estado: 'assigned' });
    io.to('rider:' + nearest.id).emit('new_delivery_assigned', { orderId: order.id });
    io.to('order:' + orderId).emit('order_status_changed', { orderId, estado: 'ASSIGNED' });
  }
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { 
    include: [
      { model: OrderItem, as: 'orderItems', include: [{ model: Product, as: 'product' }] }, 
      { model: Business, as: 'business', include: [{ model: User, as: 'user', attributes: ['id', 'nombre'] }] }, 
      { model: User, as: 'rider', attributes: ['id', 'nombre'] }, 
      { model: Payment, as: 'payment' }, 
      { model: Delivery, as: 'delivery' }
    ] 
  });
  if (!order) throw new AppError('Pedido no encontrado', 404);
  res.json({ order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const where = { cliente_id: req.user.id };
  if (estado) where.estado = estado;
  const orders = await Order.findAll({ 
    where, 
    include: [
      { model: Business, as: 'business', include: [{ model: User, as: 'user', attributes: ['nombre'] }] }, 
      { model: Payment, as: 'payment' }
    ], 
    order: [['created_at', 'DESC']] 
  });
  res.json({ orders });
});

const getBusinessOrders = asyncHandler(async (req, res) => {
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) throw new AppError('Negocio no encontrado', 404);
  const { estado } = req.query;
  const where = { business_id: business.id };
  if (estado) where.estado = estado;
  const orders = await Order.findAll({ 
    where, 
    include: [
      { model: User, as: 'client', attributes: ['nombre', 'phone'] }, 
      { model: OrderItem, as: 'orderItems' }
    ], 
    order: [['created_at', 'DESC']] 
  });
  res.json({ orders });
});

const getRiderOrders = asyncHandler(async (req, res) => {
  const { estado } = req.query;
  const where = { repartidor_id: req.user.id };
  if (estado) where.estado = estado;
  const orders = await Order.findAll({ 
    where, 
    include: [
      { model: Business, as: 'business', include: [{ model: User, as: 'user', attributes: ['nombre'] }] }, 
      { model: User, as: 'client', attributes: ['nombre', 'phone'] }
    ], 
    order: [['created_at', 'DESC']] 
  });
  res.json({ orders });
});

module.exports = { createOrder, acceptOrderByBusiness, getOrder, getMyOrders, getBusinessOrders, getRiderOrders, assignRiderIfAvailable };

