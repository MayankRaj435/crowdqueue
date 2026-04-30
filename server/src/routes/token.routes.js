const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { joinQueueLimiter } = require('../middleware/rateLimiter');
const { joinQueue, getMyTokens, getTokenById, cancelToken, rateToken } = require('../controllers/token.controller');

router.post('/join/:queueId', authenticate, joinQueueLimiter, joinQueue);
router.get('/my', authenticate, getMyTokens);
router.get('/:id', authenticate, getTokenById);
router.patch('/:id/cancel', authenticate, cancelToken);
router.patch('/:id/rate', authenticate, rateToken);

module.exports = router;
