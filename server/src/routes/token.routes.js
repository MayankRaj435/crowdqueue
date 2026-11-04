const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { joinQueueLimiter } = require('../middleware/rateLimiter');
const {
  joinQueue,
  getMyTokens,
  getTokenById,
  cancelToken,
  rateToken,
  tokenQuerySchema,
  cancelTokenSchema,
  rateTokenSchema,
} = require('../controllers/token.controller');

router.post('/join/:queueId', authenticate, joinQueueLimiter, joinQueue);
router.get('/my', authenticate, validate(tokenQuerySchema, 'query'), getMyTokens);
router.get('/:id', authenticate, getTokenById);
router.patch('/:id/cancel', authenticate, validate(cancelTokenSchema), cancelToken);
router.patch('/:id/rate', authenticate, validate(rateTokenSchema), rateToken);

module.exports = router;
