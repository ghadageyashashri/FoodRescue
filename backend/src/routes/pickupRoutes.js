const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('volunteer', 'admin'), pickupController.createOrAssignPickup);
router.get('/my', authenticate, authorize('volunteer', 'admin'), pickupController.getMyPickups);
router.get('/available', authenticate, pickupController.getAvailableTasks);
router.patch('/:id/status', authenticate, authorize('volunteer', 'admin'), pickupController.updatePickupStatus);

module.exports = router;
