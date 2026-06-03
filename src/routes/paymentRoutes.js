const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { createPaymentPreference, mpWebhook } = require('../controllers/paymentController');

router.post('/preference', authenticate, authorize('cliente'), createPaymentPreference);
router.post('/webhook', express.raw({ type: 'application/json' }), mpWebhook);

module.exports = router;
