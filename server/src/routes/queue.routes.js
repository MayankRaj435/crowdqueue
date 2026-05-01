const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createQueue, getQueueById, getMyQueues, updateQueue, updateQueueStatus, deleteQueue, callNext } = require('../controllers/queue.controller');

router.post('/', authenticate, authorize('org_admin'), createQueue);
router.get('/my', authenticate, authorize('org_admin', 'staff'), getMyQueues);
router.get('/:id', getQueueById);
router.post('/:id/next', authenticate, authorize('org_admin', 'staff', 'super_admin'), callNext);
router.put('/:id', authenticate, authorize('org_admin'), updateQueue);
router.patch('/:id/status', authenticate, authorize('org_admin', 'staff'), updateQueueStatus);
router.delete('/:id', authenticate, authorize('org_admin'), deleteQueue);

module.exports = router;


