const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { createOrder, getOrder, getMyOrders, acceptOrderByBusiness, getBusinessOrders, getRiderOrders } = require('../controllers/orderController');

router.post('/', authenticate, authorize('cliente'), createOrder);
router.get('/me', authenticate, authorize('cliente'), getMyOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:orderId/accept', authenticate, authorize('negocio'), acceptOrderByBusiness);
router.get('/business/me', authenticate, authorize('negocio'), getBusinessOrders);
router.get('/rider/me', authenticate, authorize('repartidor'), getRiderOrders);

module.exports = router;
