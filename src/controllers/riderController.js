const { RiderProfile, Commission, Order } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');

const getRiderProfile = asyncHandler(async (req, res) => {
  const profile = await RiderProfile.findOne({ where: { user_id: req.user.id } });
  if (!profile) throw new AppError('Perfil de repartidor no encontrado', 404);
  res.json({ profile });
});

const updateAvailability = asyncHandler(async (req, res) => {
  const profile = await RiderProfile.findOne({ where: { user_id: req.user.id } });
  if (!profile) throw new AppError('Perfil de repartidor no encontrado', 404);
  await profile.update({ disponible: req.body.disponible });
  res.json({ profile });
});

const getEarnings = asyncHandler(async (req, res) => {
  let where = { repartidor_id: req.user.id, estado: 'PAGADO' };
  const commissions = await Commission.findAll({ where, include: [{ model: Order, as: 'order', attributes: ['created_at'] }] });
  res.json({ commissions });
});

module.exports = { getRiderProfile, updateAvailability, getEarnings };

