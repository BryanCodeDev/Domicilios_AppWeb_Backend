const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getRiderProfile, updateAvailability, getEarnings } = require('../controllers/riderController');

router.get('/profile', authenticate, authorize('repartidor'), getRiderProfile);
router.patch('/availability', authenticate, authorize('repartidor'), updateAvailability);
router.get('/earnings', authenticate, authorize('repartidor'), getEarnings);

module.exports = router;
