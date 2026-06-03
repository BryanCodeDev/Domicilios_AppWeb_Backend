const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { createProduct, updateProduct, deleteProduct, getProductsByBusiness } = require('../controllers/productController');

router.post('/', authenticate, authorize('negocio'), createProduct);
router.put('/:id', authenticate, authorize('negocio'), updateProduct);
router.delete('/:id', authenticate, authorize('negocio'), deleteProduct);
router.get('/business/:businessId', getProductsByBusiness);

module.exports = router;
