const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getUserBusiness, createBusiness, updateBusiness, getBusinesses, getBusinessById } = require('../controllers/businessController');
const { getProductsByBusiness } = require('../controllers/productController');

router.get('/', getBusinesses);
router.get('/:id', getBusinessById);
router.get('/:businessId/products', getProductsByBusiness);
router.get('/me', authenticate, authorize('negocio'), getUserBusiness);
router.post('/', authenticate, authorize('negocio'), createBusiness);
router.put('/', authenticate, authorize('negocio'), updateBusiness);

module.exports = router;
