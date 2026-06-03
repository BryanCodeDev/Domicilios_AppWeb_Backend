const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { updateLocation, acceptDelivery, updateDeliveryStatus, getActiveDelivery } = require('../controllers/deliveryController');

router.post('/location', authenticate, authorize('repartidor'), updateLocation);
router.post('/accept', authenticate, authorize('repartidor'), acceptDelivery);
router.patch('/:orderId/status', authenticate, authorize('repartidor'), updateDeliveryStatus);
router.get('/active', authenticate, authorize('repartidor'), getActiveDelivery);

module.exports = router;
