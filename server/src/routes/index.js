const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/orgs', require('./org.routes'));
router.use('/queues', require('./queue.routes'));
router.use('/tokens', require('./token.routes'));

module.exports = router;
