const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const Organization = require('../models/Organization');
const { logStatusChange } = require('../services/historyService');
const { createNotification } = require('../services/notificationService');

/**
 * NGO requests a donation
 * POST /api/v1/donations/:id/request
 */
const requestDonation = async (req, res, next) => {
  try {
    const { requestedQuantity, notes } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `This donation is currently '${donation.status}' and cannot be requested.`,
      });
    }

    if (new Date() > donation.useByDate) {
      donation.status = 'EXPIRED';
      await donation.save();
      return res.status(400).json({
        success: false,
        message: 'This donation has expired and cannot be requested.',
      });
    }

    // Check if NGO is verified or display warning
    const org = await Organization.findOne({ user: req.user._id });
    if (org && org.verificationStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your organization verification was rejected. You cannot request donations.',
      });
    }

    // Prevent duplicate request
    const existing = await DonationRequest.findOne({
      donation: donation._id,
      ngo: req.user._id,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a request for this donation.',
      });
    }

    const request = await DonationRequest.create({
      donation: donation._id,
      ngo: req.user._id,
      requestedQuantity: requestedQuantity || donation.quantity,
      notes: notes || '',
      status: 'PENDING',
    });

    // Update donation status to REQUESTED
    const prevStatus = donation.status;
    donation.status = 'REQUESTED';
    donation.requestedBy = req.user._id;
    await donation.save();

    await logStatusChange(
      donation._id,
      prevStatus,
      'REQUESTED',
      req.user._id,
      `Requested by NGO: ${org ? org.organizationName : req.user.name}`
    );

    // Notify donor
    await createNotification({
      recipient: donation.donor,
      title: 'New Donation Request',
      message: `${org ? org.organizationName : req.user.name} requested your donation of "${donation.foodName}".`,
      type: 'REQUEST_CREATED',
      link: `/donations/${donation._id}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Donation requested successfully',
      request,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's requests (for NGO or Donor)
 * GET /api/v1/requests/my
 */
const getMyRequests = async (req, res, next) => {
  try {
    let requests;

    if (req.user.role === 'ngo') {
      requests = await DonationRequest.find({ ngo: req.user._id })
        .populate({
          path: 'donation',
          populate: { path: 'donor', select: 'name phone email address' },
        })
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'donor') {
      // Find all donations created by this donor
      const donorDonations = await Donation.find({ donor: req.user._id }).select('_id');
      const donationIds = donorDonations.map((d) => d._id);

      requests = await DonationRequest.find({ donation: { $in: donationIds } })
        .populate('donation')
        .populate('ngo', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      requests = await DonationRequest.find()
        .populate('donation')
        .populate('ngo', 'name email phone')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept request (by Donor)
 * POST /api/v1/requests/:id/accept
 */
const acceptRequest = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id).populate('donation');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Donation request not found' });
    }

    const donation = await Donation.findById(request.donation._id);

    // Check authorization: must be the donor or admin
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the donor who listed this food can accept requests.',
      });
    }

    if (donation.status !== 'REQUESTED' && donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Donation is already '${donation.status}' and cannot be accepted.`,
      });
    }

    request.status = 'ACCEPTED';
    request.responseNotes = req.body.responseNotes || 'Accepted by donor';
    await request.save();

    // Reject other requests for this donation if any
    await DonationRequest.updateMany(
      { donation: donation._id, _id: { $ne: request._id }, status: 'PENDING' },
      { status: 'REJECTED', responseNotes: 'Another NGO request was accepted for this donation' }
    );

    const prevStatus = donation.status;
    donation.status = 'ACCEPTED';
    donation.requestedBy = request.ngo;
    await donation.save();

    await logStatusChange(
      donation._id,
      prevStatus,
      'ACCEPTED',
      req.user._id,
      'Donation request accepted by donor. Ready for pickup assignment.'
    );

    // Notify NGO
    await createNotification({
      recipient: request.ngo,
      title: 'Donation Request Accepted',
      message: `Your request for "${donation.foodName}" has been accepted! Volunteer pickup will be scheduled.`,
      type: 'REQUEST_ACCEPTED',
      link: `/donations/${donation._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Request accepted successfully. Ready for pickup assignment.',
      request,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel request (by NGO)
 * PATCH /api/v1/requests/:id/cancel
 */
const cancelRequest = async (req, res, next) => {
  try {
    const request = await DonationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request in '${request.status}' status.`,
      });
    }

    request.status = 'CANCELLED';
    await request.save();

    // Revert donation status if this was the active request
    const donation = await Donation.findById(request.donation);
    if (donation && donation.status === 'REQUESTED' && donation.requestedBy.toString() === req.user._id.toString()) {
      donation.status = 'AVAILABLE';
      donation.requestedBy = null;
      await donation.save();

      await logStatusChange(
        donation._id,
        'REQUESTED',
        'AVAILABLE',
        req.user._id,
        'Request cancelled by NGO. Donation is available again.'
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm receipt of delivered food by NGO
 * POST /api/v1/donations/:id/receive
 */
const confirmReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.requestedBy && donation.requestedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the NGO that requested this donation can confirm receipt.',
      });
    }

    if (!['DELIVERED', 'PICKED_UP'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm receipt for donation with status '${donation.status}'. It must be DELIVERED or PICKED_UP.`,
      });
    }

    const prevStatus = donation.status;
    donation.status = 'RECEIVED';
    await donation.save();

    await logStatusChange(
      donation._id,
      prevStatus,
      'RECEIVED',
      req.user._id,
      'Food receipt confirmed by NGO.'
    );

    // Notify Donor
    await createNotification({
      recipient: donation.donor,
      title: 'Food Received by NGO',
      message: `Your donation of "${donation.foodName}" has been safely received by the NGO!`,
      type: 'RECEIVED',
      link: `/donations/${donation._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Receipt confirmed successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record distribution & impact (meals/people served) by NGO
 * POST /api/v1/donations/:id/distribute
 */
const recordDistribution = async (req, res, next) => {
  try {
    const { peopleServed, notes } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.requestedBy && donation.requestedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the receiving NGO can record distribution for this donation.',
      });
    }

    if (!['RECEIVED', 'DELIVERED'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Donation must be in RECEIVED or DELIVERED status to record distribution. Current status: '${donation.status}'.`,
      });
    }

    const servedCount = Number(peopleServed) || Number(donation.quantity) || 1;
    const prevStatus = donation.status;

    donation.peopleServed = servedCount;
    donation.status = 'COMPLETED';
    await donation.save();

    await logStatusChange(
      donation._id,
      prevStatus,
      'COMPLETED',
      req.user._id,
      `Food distributed successfully! Served ${servedCount} people/meals. Note: ${notes || 'None'}`
    );

    // Notify Donor
    await createNotification({
      recipient: donation.donor,
      title: 'Food Rescue Completed!',
      message: `Congratulations! Your donation of "${donation.foodName}" was distributed, feeding ${servedCount} people!`,
      type: 'DISTRIBUTED',
      link: `/donations/${donation._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Distribution recorded and donation marked completed',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestDonation,
  getMyRequests,
  acceptRequest,
  cancelRequest,
  confirmReceipt,
  recordDistribution,
};
