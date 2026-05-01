const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { registerOrg, getNearbyOrgs, getOrgById, updateOrg, createStaff, getStaff, getAnalytics } = require('../controllers/org.controller');

router.post('/register', authenticate, registerOrg);
router.get('/nearby', getNearbyOrgs);
router.get('/:id', getOrgById);
router.put('/:id', authenticate, authorize('org_admin'), updateOrg);
router.post('/:id/staff', authenticate, authorize('org_admin'), createStaff);
router.get('/:id/staff', authenticate, authorize('org_admin'), getStaff);
router.get('/:id/analytics', authenticate, authorize('org_admin'), getAnalytics);

module.exports = router;
