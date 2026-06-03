const { Payment, Order, Business } = require('../models');
const { AppError, asyncHandler } = require('../utils/AppError');
const { MercadoPagoConfig, Preference, Payment: MpPayment } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN' });

const createPaymentPreference = asyncHandler(async (req, res) => {
  const { order_id } = req.body;
  const order = await Order.findByPk(order_id, { include: [{ model: Business, as: 'business' }] });
  if (!order) throw new AppError('Pedido no encontrado', 404);
  if (String(order.cliente_id) !== String(req.user.id)) throw new AppError('No autorizado', 403);
  const payment = await Payment.findOne({ where: { order_id } });
  if (payment) throw new AppError('Ya existe un pago para este pedido', 400);
  const preference = {
    items: [{ title: `Pedido #${order.id}`, quantity: 1, unit_price: Number(order.total), currency_id: 'COP' }],
    external_reference: String(order.id),
    back_urls: { success: `${process.env.FRONTEND_URL}/client/orders`, failure: `${process.env.FRONTEND_URL}/client/orders`, pending: `${process.env.FRONTEND_URL}/client/orders` },
    auto_return: 'approved',
    binary_mode: true
  };
  const response = await new Preference(client).create({ body: preference });
  const newPayment = await Payment.create({ order_id: order.id, monto: order.total, estado: 'PENDING', metodo: 'Mercado Pago', mp_payment_id: response.body.id });
  res.json({ init_point: response.body.init_point, payment: newPayment });
});

const mpWebhook = asyncHandler(async (req, res) => {
  const { type, data } = req.query;
  if (type === 'payment') {
    const paymentId = data.id;
    const paymentInfo = await new MpPayment(client).get({ id: paymentId });
    const payment = await Payment.findOne({ where: { mp_payment_id: String(paymentId) } });
    if (!payment) return res.sendStatus(404);
    const status = paymentInfo.body.status === 'approved' ? 'APPROVED' : paymentInfo.body.status === 'rejected' ? 'REJECTED' : 'PENDING';
    await payment.update({ estado: status });
    if (status === 'APPROVED') {
      await Order.update({ estado: 'ACCEPTED' }, { where: { id: payment.order_id } });
      const order = await Order.findByPk(payment.order_id);
      const io = req.app.get('io');
      io.to(`order:${payment.order_id}`).emit('order_status_changed', { orderId: payment.order_id, estado: 'ACCEPTED' });
      io.to(`business:${order.business_id}`).emit('payment_approved', { orderId: payment.order_id });
    }
  }
  res.sendStatus(200);
});

module.exports = { createPaymentPreference, mpWebhook };
