const { Product, Business } = require('../models');
const { schemas } = require('../middlewares/validate');
const { AppError, asyncHandler } = require('../utils/AppError');

const createProduct = asyncHandler(async (req, res) => {
  const data = schemas.createProduct.parse(req.body);
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) throw new AppError('No tienes un negocio registrado', 404);
  if (String(data.business_id) !== String(business.id)) {
    throw new AppError('No puedes agregar productos a otro negocio', 403);
  }
  const product = await Product.create({ ...data, business_id: business.id });
  res.status(201).json({ product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = schemas.createProduct.partial().parse(req.body);
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) throw new AppError('Negocio no encontrado', 404);
  const product = await Product.findOne({ where: { id, business_id: business.id } });
  if (!product) throw new AppError('Producto no encontrado', 404);
  await product.update(data);
  res.json({ product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const business = await Business.findOne({ where: { user_id: req.user.id } });
  if (!business) throw new AppError('Negocio no encontrado', 404);
  const product = await Product.findOne({ where: { id, business_id: business.id } });
  if (!product) throw new AppError('Producto no encontrado', 404);
  await product.update({ disponible: false });
  res.json({ message: 'Producto eliminado correctamente' });
});

const getProductsByBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const products = await Product.findAll({ where: { business_id: businessId, disponible: true } });
  res.json({ products });
});

module.exports = { createProduct, updateProduct, deleteProduct, getProductsByBusiness };

