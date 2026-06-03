const { Business, User, Product } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');

const getUserBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) {
    return res.status(404).json({ message: 'No tienes un negocio registrado' });
  }
  res.json({ business });
});

const createBusiness = asyncHandler(async (req, res) => {
  const existing = await Business.findOne({ where: { user_id: req.user.id } });
  if (existing) {
    return res.status(400).json({ message: 'Ya tienes un negocio registrado' });
  }
  const { nombre, categoria, direccion, descripcion, lat, lng, logo_url, horario } = req.body;
  const business = await Business.create({
    user_id: req.user.id,
    nombre,
    categoria,
    direccion,
    descripcion,
    lat,
    lng,
    logo_url,
    horario
  });
  res.status(201).json({ business });
});

const updateBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) {
    return res.status(404).json({ message: 'Negocio no encontrado' });
  }
  await business.update(req.body);
  res.json({ business });
});

const getBusinesses = asyncHandler(async (req, res) => {
  const { categoria } = req.query;
  const where = { activo: true };
  if (categoria) {
    where.categoria = categoria;
  }
  const businesses = await Business.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nombre', 'phone', 'avatar_url']
      }
    ]
  });
  res.json({ businesses });
});

const getBusinessById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const business = await Business.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nombre', 'phone']
      },
      {
        model: Product,
        as: 'products',
        where: { disponible: true },
        required: false
      }
    ]
  });
  if (!business) {
    return res.status(404).json({ message: 'Negocio no encontrado' });
  }
  res.json({ business });
});

module.exports = {
  getUserBusiness,
  createBusiness,
  updateBusiness,
  getBusinesses,
  getBusinessById
};
