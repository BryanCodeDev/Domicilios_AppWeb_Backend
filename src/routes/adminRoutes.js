const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getDashboardStats, getAllUsers, updateUserStatus, getAllOrders } = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/orders', getAllOrders);

module.exports = router;
