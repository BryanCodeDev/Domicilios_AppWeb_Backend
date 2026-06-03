const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const businessRoutes = require('./businessRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const paymentRoutes = require('./paymentRoutes');
const ratingRoutes = require('./ratingRoutes');
const riderRoutes = require('./riderRoutes');
const adminRoutes = require('./adminRoutes');
const { mpWebhook } = require('../controllers/paymentController');

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/payments', paymentRoutes);
router.use('/ratings', ratingRoutes);
router.use('/rider', riderRoutes);
router.use('/admin', adminRoutes);
router.post('/payments/webhook', express.raw({ type: 'application/json' }), mpWebhook);

module.exports = router;
