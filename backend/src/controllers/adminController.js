const Organization = require('../models/Organization');
const User = require('../models/User');
const Donation = require('../models/Donation');
const StatusHistory = require('../models/StatusHistory');
const { createNotification } = require('../services/notificationService');

/**
 * Get all organizations (NGOs)
 * GET /api/v1/organizations
 */
const getOrganizations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;

    const organizations = await Organization.find(filter)
      .populate('user', 'name email phone accountStatus')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject NGO verification request
 * PATCH /api/v1/admin/organizations/:id/verify
 */
const verifyOrganization = async (req, res, next) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be verified, rejected, or pending.',
      });
    }

    const org = await Organization.findById(req.params.id).populate('user');
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    org.verificationStatus = verificationStatus;
    org.verificationNotes = verificationNotes || '';
    org.verifiedAt = new Date();
    org.verifiedBy = req.user._id;
    await org.save();

    // Notify NGO user
    await createNotification({
      recipient: org.user._id,
      title: `Organization Verification ${verificationStatus === 'verified' ? 'Approved' : 'Updated'}`,
      message: `Your organization "${org.organizationName}" verification status was updated to "${verificationStatus}". ${org.verificationNotes ? `Notes: ${org.verificationNotes}` : ''}`,
      type: 'VERIFICATION',
      link: '/ngo/dashboard',
    });

    return res.status(200).json({
      success: true,
      message: `Organization verification status updated to ${verificationStatus}`,
      organization: org,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin dashboard overview data
 * GET /api/v1/admin/overview
 */
const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonations,
      activeDonations,
      completedDonations,
      pendingNgos,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Donation.countDocuments({ status: { $in: ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'RECEIVED'] } }),
      Donation.countDocuments({ status: { $in: ['COMPLETED', 'DISTRIBUTED'] } }),
      Organization.countDocuments({ verificationStatus: 'pending' }),
      StatusHistory.find()
        .populate('donation', 'foodName quantity unit status')
        .populate('actor', 'name role')
        .sort({ timestamp: -1 })
        .limit(15),
    ]);

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalDonations,
        activeDonations,
        completedDonations,
        pendingNgos,
      },
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizations,
  verifyOrganization,
  getAdminOverview,
};
