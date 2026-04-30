const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { register, login, logout, refreshToken, verifyPhone, getMe } = require('../controllers/auth.controller');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/verify-phone', authenticate, verifyPhone);
router.get('/me', authenticate, getMe);

module.exports = router;
