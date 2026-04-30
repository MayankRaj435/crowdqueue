const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createQueue, getQueueById, updateQueue, updateQueueStatus, deleteQueue } = require('../controllers/queue.controller');

router.post('/', authenticate, authorize('org_admin'), createQueue);
router.get('/:id', getQueueById);
router.put('/:id', authenticate, authorize('org_admin'), updateQueue);
router.patch('/:id/status', authenticate, authorize('org_admin', 'staff'), updateQueueStatus);
router.delete('/:id', authenticate, authorize('org_admin'), deleteQueue);

module.exports = router;
