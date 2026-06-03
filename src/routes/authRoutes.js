const express = require('express');
const router = express.Router();
const { register, login, getProfile, refreshToken, registerFcmToken, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { parseBody, schemas } = require('../middlewares/validate');

router.post('/register', parseBody(schemas.register), register);
router.post('/login', parseBody(schemas.login), login);
router.get('/me', authenticate, getProfile);
router.post('/refresh', parseBody(schemas.refreshToken), refreshToken);
router.patch('/fcm-token', authenticate, parseBody(schemas.fcmToken), registerFcmToken);
router.post('/forgot-password', parseBody(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', parseBody(schemas.resetPassword), resetPassword);

module.exports = router;
