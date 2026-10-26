const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/overview', authenticate, authorize('admin'), adminController.getAdminOverview);
router.get('/organizations', authenticate, adminController.getOrganizations);
router.patch('/organizations/:id/verify', authenticate, authorize('admin'), adminController.verifyOrganization);

module.exports = router;
