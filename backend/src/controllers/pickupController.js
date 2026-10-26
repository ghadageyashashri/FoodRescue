const Pickup = require('../models/Pickup');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const { logStatusChange } = require('../services/historyService');
const { createNotification } = require('../services/notificationService');

/**
 * Volunteer accepts/claims a pickup task for an ACCEPTED donation
 * POST /api/v1/pickups
 */
const createOrAssignPickup = async (req, res, next) => {
  try {
    const { donationId, pickupNotes } = req.body;

    const donation = await Donation.findById(donationId).populate('requestedBy');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Donation must be in ACCEPTED status to assign pickup. Current status: '${donation.status}'.`,
      });
    }

    if (donation.assignedVolunteer && donation.assignedVolunteer.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This task has already been assigned to another volunteer.',
      });
    }

    // Get NGO organization delivery address
    let deliveryAddress = 'NGO Facility';
    if (donation.requestedBy) {
      const org = await Organization.findOne({ user: donation.requestedBy._id });
      if (org && org.address) {
        deliveryAddress = `${org.organizationName}, ${org.address}`;
      } else if (donation.requestedBy.address) {
        deliveryAddress = donation.requestedBy.address;
      }
    }

    let pickup = await Pickup.findOne({ donation: donation._id });
    if (!pickup) {
      pickup = await Pickup.create({
        donation: donation._id,
        volunteer: req.user._id,
        ngo: donation.requestedBy ? donation.requestedBy._id : null,
        pickupAddress: donation.pickupAddress,
        deliveryAddress,
        pickupNotes: pickupNotes || '',
        status: 'ASSIGNED',
      });
    } else {
      pickup.volunteer = req.user._id;
      pickup.status = 'ASSIGNED';
      pickup.pickupNotes = pickupNotes || pickup.pickupNotes;
      await pickup.save();
    }

    donation.assignedVolunteer = req.user._id;
    donation.status = 'PICKUP_ASSIGNED';
    await donation.save();

    await logStatusChange(
      donation._id,
      'ACCEPTED',
      'PICKUP_ASSIGNED',
      req.user._id,
      `Volunteer ${req.user.name} accepted pickup task.`
    );

    // Notify Donor
    await createNotification({
      recipient: donation.donor,
      title: 'Volunteer Assigned',
      message: `Volunteer ${req.user.name} (${req.user.phone}) will pick up your donation "${donation.foodName}".`,
      type: 'PICKUP_ASSIGNED',
      link: `/donations/${donation._id}`,
    });

    // Notify NGO
    if (donation.requestedBy) {
      await createNotification({
        recipient: donation.requestedBy._id,
        title: 'Volunteer Assigned to Pickup',
        message: `Volunteer ${req.user.name} has accepted pickup for "${donation.foodName}". Delivery is expected soon.`,
        type: 'PICKUP_ASSIGNED',
        link: `/donations/${donation._id}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Pickup task accepted successfully',
      pickup,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get volunteer's assigned tasks
 * GET /api/v1/pickups/my
 */
const getMyPickups = async (req, res, next) => {
  try {
    const pickups = await Pickup.find({ volunteer: req.user._id })
      .populate({
        path: 'donation',
        populate: [
          { path: 'donor', select: 'name phone email address' },
          { path: 'requestedBy', select: 'name phone email address' },
        ],
      })
      .populate('ngo', 'name phone email address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      pickups,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available tasks awaiting a volunteer
 * GET /api/v1/pickups/available
 */
const getAvailableTasks = async (req, res, next) => {
  try {
    const donations = await Donation.find({
      status: 'ACCEPTED',
      assignedVolunteer: null,
    })
      .populate('donor', 'name phone email address')
      .populate('requestedBy', 'name phone email address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      availableDonations: donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update pickup status (PICKED_UP or DELIVERED)
 * PATCH /api/v1/pickups/:id/status
 */
const updatePickupStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const pickup = await Pickup.findById(req.params.id).populate('donation');

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup record not found' });
    }

    if (pickup.volunteer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned volunteer can update this pickup status.',
      });
    }

    const donation = await Donation.findById(pickup.donation._id);
    const prevStatus = donation.status;

    if (status === 'PICKED_UP') {
      if (pickup.status !== 'ASSIGNED') {
        return res.status(400).json({
          success: false,
          message: `Cannot mark as PICKED_UP from status '${pickup.status}'.`,
        });
      }

      pickup.status = 'PICKED_UP';
      pickup.pickedUpAt = new Date();
      if (notes) pickup.pickupNotes = notes;
      await pickup.save();

      donation.status = 'PICKED_UP';
      await donation.save();

      await logStatusChange(
        donation._id,
        prevStatus,
        'PICKED_UP',
        req.user._id,
        `Food picked up from donor by volunteer ${req.user.name}. In transit.`
      );

      // Notify Donor & NGO
      await createNotification({
        recipient: donation.donor,
        title: 'Food Picked Up',
        message: `Volunteer ${req.user.name} has picked up your donation of "${donation.foodName}". Thank you!`,
        type: 'PICKED_UP',
        link: `/donations/${donation._id}`,
      });

      if (donation.requestedBy) {
        await createNotification({
          recipient: donation.requestedBy,
          title: 'Food In Transit',
          message: `Volunteer ${req.user.name} has picked up "${donation.foodName}" and is heading to deliver it to you.`,
          type: 'PICKED_UP',
          link: `/donations/${donation._id}`,
        });
      }
    } else if (status === 'DELIVERED') {
      if (pickup.status !== 'PICKED_UP') {
        return res.status(400).json({
          success: false,
          message: `Cannot mark as DELIVERED until food has been PICKED_UP. Current status: '${pickup.status}'.`,
        });
      }

      pickup.status = 'DELIVERED';
      pickup.deliveredAt = new Date();
      if (notes) pickup.deliveryNotes = notes;
      await pickup.save();

      donation.status = 'DELIVERED';
      await donation.save();

      await logStatusChange(
        donation._id,
        prevStatus,
        'DELIVERED',
        req.user._id,
        `Food delivered to NGO by volunteer ${req.user.name}. Awaiting NGO receipt confirmation.`
      );

      // Notify NGO
      if (donation.requestedBy) {
        await createNotification({
          recipient: donation.requestedBy,
          title: 'Food Delivered! Please Confirm Receipt',
          message: `Volunteer ${req.user.name} has delivered "${donation.foodName}". Please confirm receipt in your dashboard.`,
          type: 'DELIVERED',
          link: `/donations/${donation._id}`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update. Allowed values: PICKED_UP, DELIVERED.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Pickup status updated to ${status}`,
      pickup,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrAssignPickup,
  getMyPickups,
  getAvailableTasks,
  updatePickupStatus,
};
