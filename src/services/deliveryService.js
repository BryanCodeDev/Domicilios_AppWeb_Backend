const { Op } = require('sequelize');
const { Order, Delivery, RiderProfile, User, Commission } = require('../models');

const RIDER_RADIUS_KM = 5;

const findNearestRider = async (lat, lng) => {
  const riders = await User.findAll({
    where: { rol: 'repartidor', activo: true },
    include: [{ model: RiderProfile, as: 'riderProfile', where: { disponible: true }, required: true }]
  });

  let best = null;
  let bestDist = Infinity;

  for (const rider of riders) {
    const p = rider.riderProfile;
    if (!p.lat_actual || !p.lng_actual) continue;
    const d = haversineKm(lat, lng, Number(p.lat_actual), Number(p.lng_actual));
    if (d < bestDist && d <= RIDER_RADIUS_KM) {
      bestDist = d;
      best = rider;
    }
  }

  return best;
};

const createDeliveryForOrder = async (order) => {
  const rider = await findNearestRider(order.lat_entrega, order.lng_entrega);
  if (!rider) return null;

  const delivery = await Delivery.create({
    order_id: order.id,
    repartidor_id: rider.id,
    estado: 'assigned'
  });

  await order.update({ repartidor_id: rider.id, estado: 'ASSIGNED' });

  return delivery;
};

const completeDelivery = async (order) => {
  await order.update({ estado: 'DELIVERED' });
  const total = Number(order.total);
  await Commission.create({
    order_id: order.id,
    business_id: order.business_id,
    repartidor_id: order.repartidor_id,
    porcentaje_neg: 15,
    porcentaje_rep: 10,
    monto_negocio: Number((total * 0.15).toFixed(2)),
    monto_repartidor: Number((total * 0.10).toFixed(2)),
    estado: 'PENDIENTE'
  });

  const commission = await Commission.findOne({ where: { order_id: order.id } });
  return commission;
};

const getRiderEarnings = async (riderId, filters = {}) => {
  const where = { repartidor_id: riderId };
  if (filters.estado) where.estado = filters.estado;
  if (filters.from || filters.to) {
    where.created_at = {};
    if (filters.from) where.created_at[Op.gte] = new Date(filters.from);
    if (filters.to) where.created_at[Op.lte] = new Date(filters.to);
  }

  const commissions = await Commission.findAll({
    where,
    include: [{ model: Order, as: 'order', attributes: ['id', 'created_at'] }]
  });

  const total = commissions.reduce((sum, c) => sum + Number(c.monto_repartidor), 0);
  return { commissions, total };
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = { findNearestRider, createDeliveryForOrder, completeDelivery, getRiderEarnings };

