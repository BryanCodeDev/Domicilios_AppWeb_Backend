const mercadopago = require('mercadopago');

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN' });

const createPreference = async (order) => {
  const preference = {
    items: [
      {
        title: `Pedido #${order.id}`,
        quantity: 1,
        unit_price: Number(order.total),
        currency_id: 'COP'
      }
    ],
    external_reference: String(order.id),
    back_urls: {
      success: `${process.env.FRONTEND_URL}/client/orders`,
      failure: `${process.env.FRONTEND_URL}/client/orders`,
      pending: `${process.env.FRONTEND_URL}/client/orders`
    },
    auto_return: 'approved',
    binary_mode: true
  };

  const response = await mercadopago.preferences.create(preference);
  return response.body;
};

module.exports = { createPreference };
