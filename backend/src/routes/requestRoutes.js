const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my', authenticate, requestController.getMyRequests);
router.post('/:id/accept', authenticate, authorize('donor', 'admin'), requestController.acceptRequest);
router.patch('/:id/cancel', authenticate, authorize('ngo', 'admin'), requestController.cancelRequest);

module.exports = router;
