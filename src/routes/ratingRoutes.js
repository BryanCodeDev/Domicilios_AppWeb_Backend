const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { createRating } = require('../controllers/ratingController');

router.post('/', authenticate, createRating);

module.exports = router;
