const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { registerOrg, getNearbyOrgs, getOrgById, updateOrg } = require('../controllers/org.controller');

router.post('/register', authenticate, registerOrg);
router.get('/nearby', getNearbyOrgs);
router.get('/:id', getOrgById);
router.put('/:id', authenticate, authorize('org_admin'), updateOrg);

module.exports = router;
