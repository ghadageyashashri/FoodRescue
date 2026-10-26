const Donation = require('../models/Donation');
const StatusHistory = require('../models/StatusHistory');
const DonationRequest = require('../models/DonationRequest');
const Pickup = require('../models/Pickup');
const { logStatusChange } = require('../services/historyService');
const { createNotification } = require('../services/notificationService');

/**
 * Check and mark expired donations
 */
const autoMarkExpired = async () => {
  try {
    const expiredDonations = await Donation.find({
      status: 'AVAILABLE',
      useByDate: { $lt: new Date() },
    });

    for (const d of expiredDonations) {
      d.status = 'EXPIRED';
      await d.save();
      await logStatusChange(d._id, 'AVAILABLE', 'EXPIRED', d.donor, 'Automatically marked expired based on use-by date');
    }
  } catch (err) {
    console.error('Error auto-marking expired donations:', err.message);
  }
};

/**
 * Create a new food donation
 * POST /api/v1/donations
 */
const createDonation = async (req, res, next) => {
  try {
    const {
      foodName,
      description,
      category,
      quantity,
      unit,
      isVegetarian,
      preparationDate,
      useByDate,
      storageConditions,
      pickupAddress,
      pickupContactName,
      pickupContactPhone,
      imageUrl,
    } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      foodName,
      description,
      category: category || 'cooked_meals',
      quantity,
      unit: unit || 'meals',
      isVegetarian: isVegetarian !== undefined ? isVegetarian : true,
      preparationDate,
      useByDate,
      storageConditions: storageConditions || 'ambient',
      pickupAddress,
      pickupContactName: pickupContactName || req.user.name,
      pickupContactPhone: pickupContactPhone || req.user.phone,
      imageUrl: imageUrl || '',
      status: 'AVAILABLE',
    });

    // Log status history
    await logStatusChange(
      donation._id,
      'INITIAL',
      'AVAILABLE',
      req.user._id,
      'Food donation listed and made available for rescue'
    );

    return res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all donations with filters and search
 * GET /api/v1/donations
 */
const getDonations = async (req, res, next) => {
  try {
    await autoMarkExpired();

    const { status, category, search, donor, isVegetarian, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }

    if (category) {
      filter.category = category;
    }

    if (donor) {
      filter.donor = donor;
    }

    if (isVegetarian !== undefined) {
      filter.isVegetarian = isVegetarian === 'true';
    }

    if (search) {
      filter.$or = [
        { foodName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { pickupAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'name email phone address')
        .populate('requestedBy', 'name email phone')
        .populate('assignedVolunteer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Donation.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single donation by ID with history & requests
 * GET /api/v1/donations/:id
 */
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('requestedBy', 'name email phone')
      .populate('assignedVolunteer', 'name email phone');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check expiry
    if (donation.status === 'AVAILABLE' && new Date() > donation.useByDate) {
      donation.status = 'EXPIRED';
      await donation.save();
      await logStatusChange(donation._id, 'AVAILABLE', 'EXPIRED', donation.donor._id, 'Donation expired');
    }

    const history = await StatusHistory.find({ donation: donation._id })
      .populate('actor', 'name role')
      .sort({ timestamp: 1 });

    const requests = await DonationRequest.find({ donation: donation._id })
      .populate('ngo', 'name email phone')
      .sort({ createdAt: -1 });

    const pickup = await Pickup.findOne({ donation: donation._id })
      .populate('volunteer', 'name email phone')
      .populate('ngo', 'name email phone');

    return res.status(200).json({
      success: true,
      donation,
      history,
      requests,
      pickup,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update donation (Only editable if still in AVAILABLE status)
 * PATCH /api/v1/donations/:id
 */
const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check authorization: must be donor or admin
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this donation.',
      });
    }

    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit donation in '${donation.status}' state. Only AVAILABLE donations can be edited.`,
      });
    }

    const allowedUpdates = [
      'foodName',
      'description',
      'category',
      'quantity',
      'unit',
      'isVegetarian',
      'preparationDate',
      'useByDate',
      'storageConditions',
      'pickupAddress',
      'pickupContactName',
      'pickupContactPhone',
      'imageUrl',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        donation[field] = req.body[field];
      }
    });

    await donation.save();

    await logStatusChange(
      donation._id,
      donation.status,
      donation.status,
      req.user._id,
      'Donation details updated by donor'
    );

    return res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a donation
 * POST /api/v1/donations/:id/cancel
 */
const cancelDonation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this donation.',
      });
    }

    if (['PICKED_UP', 'DELIVERED', 'RECEIVED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel donation in '${donation.status}' state.`,
      });
    }

    const previousStatus = donation.status;
    donation.status = 'CANCELLED';
    donation.cancellationReason = reason || 'Cancelled by donor';
    await donation.save();

    // Cancel pending requests
    await DonationRequest.updateMany(
      { donation: donation._id, status: 'PENDING' },
      { status: 'CANCELLED', responseNotes: 'Donation was cancelled by donor' }
    );

    // Cancel pickup if assigned
    await Pickup.updateMany(
      { donation: donation._id, status: 'ASSIGNED' },
      { status: 'CANCELLED', deliveryNotes: 'Donation was cancelled' }
    );

    await logStatusChange(
      donation._id,
      previousStatus,
      'CANCELLED',
      req.user._id,
      `Donation cancelled. Reason: ${donation.cancellationReason}`
    );

    if (donation.requestedBy) {
      await createNotification({
        recipient: donation.requestedBy,
        title: 'Donation Cancelled',
        message: `The donation "${donation.foodName}" was cancelled by the donor.`,
        type: 'GENERAL',
        link: `/donations/${donation._id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
};
