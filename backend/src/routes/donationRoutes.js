const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const requestController = require('../controllers/requestController');
const { donationCreateValidator } = require('../validators/donationValidator');
const { authenticate, authorize } = require('../middleware/auth');

// Public listing & search
router.get('/', donationController.getDonations);
router.get('/:id', donationController.getDonationById);

// Donor operations
router.post('/', authenticate, authorize('donor', 'admin'), donationCreateValidator, donationController.createDonation);
router.patch('/:id', authenticate, donationController.updateDonation);
router.post('/:id/cancel', authenticate, donationController.cancelDonation);

// NGO operations on donations
router.post('/:id/request', authenticate, authorize('ngo', 'admin'), requestController.requestDonation);
router.post('/:id/receive', authenticate, authorize('ngo', 'admin'), requestController.confirmReceipt);
router.post('/:id/distribute', authenticate, authorize('ngo', 'admin'), requestController.recordDistribution);

module.exports = router;
