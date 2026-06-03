const { Rating, User, Order } = require('../models');
const { validate, schemas } = require('../middlewares/validate');
const { AppError, asyncHandler } = require('../utils/AppError');

const createRating = asyncHandler(async (req, res) => {
  const data = schemas.createRating.parse(req.body);
  const order = await Order.findByPk(data.order_id);
  if (!order) throw new AppError('Pedido no encontrado', 404);
  if (String(order.cliente_id) !== String(req.user.id)) throw new AppError('No autorizado', 403);
  if (order.estado !== 'DELIVERED') throw new AppError('Solo puedes calificar pedidos entregados', 400);
  const existing = await Rating.findOne({ where: { order_id: data.order_id, from_user_id: req.user.id, rol_calificado: data.rol_calificado } });
  if (existing) throw new AppError('Ya calificaste este rol para este pedido', 400);
  const rating = await Rating.create({ ...data, from_user_id: req.user.id });
  await updateAverageRating(data.to_user_id, data.rol_calificado, data.puntaje);
  res.status(201).json({ rating });
});

const updateAverageRating = async (userId, rol, newScore) => {
  const ratings = await Rating.findAll({ where: { to_user_id: userId, rol_calificado: rol } });
  const avg = ratings.reduce((sum, r) => sum + r.puntaje, 0) / ratings.length;
  if (rol === 'negocio') {
    await require('../models').Business.update({ calificacion_promedio: avg }, { where: { user_id: userId } });
  } else {
    await require('../models').RiderProfile.update({ calificacion: avg }, { where: { user_id: userId } });
  }
};

module.exports = { createRating };
