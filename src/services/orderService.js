const { Order, OrderItem, Product, Business, Delivery, Rating, Commission } = require('../models');

const buildOrderWithItems = async (order) => {
  const orderWithItems = await Order.findByPk(order.id, {
    include: [
      { model: OrderItem, as: 'orderItems' },
      { model: Business, as: 'business', include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'nombre', 'phone'] }] },
      { model: require('../models').User, as: 'client', attributes: ['id', 'nombre'] },
      { model: require('../models').User, as: 'rider', attributes: ['id', 'nombre'] }
    ]
  });
  return orderWithItems;
};

module.exports = { buildOrderWithItems };
