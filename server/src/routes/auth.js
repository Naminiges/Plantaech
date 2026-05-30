const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, requestOtp, verifyOtp, resetPassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, getMe);
router.put('/password', requireAuth, changePassword);

module.exports = router;
