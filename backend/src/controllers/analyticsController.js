const Donation = require('../models/Donation');
const User = require('../models/User');
const Organization = require('../models/Organization');

/**
 * Public & dashboard analytics derived from real database records
 * GET /api/v1/analytics/overview
 */
const getOverview = async (req, res, next) => {
  try {
    const [
      totalDonations,
      availableDonations,
      completedDonations,
      donorsCount,
      ngosCount,
      volunteersCount,
      quantityAggregation,
      peopleServedAggregation,
      categoryStats,
      statusStats,
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'AVAILABLE', useByDate: { $gt: new Date() } }),
      Donation.countDocuments({ status: { $in: ['COMPLETED', 'DISTRIBUTED'] } }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      Donation.aggregate([
        { $match: { status: { $in: ['PICKED_UP', 'DELIVERED', 'RECEIVED', 'DISTRIBUTED', 'COMPLETED'] } } },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
      ]),
      Donation.aggregate([
        { $group: { _id: null, totalPeopleServed: { $sum: '$peopleServed' } } },
      ]),
      Donation.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      ]),
      Donation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalQuantity = quantityAggregation.length > 0 ? quantityAggregation[0].totalQuantity : 0;
    const totalPeopleServed = peopleServedAggregation.length > 0 ? peopleServedAggregation[0].totalPeopleServed : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        availableDonations,
        completedDonations,
        totalQuantityRescued: Math.round(totalQuantity * 10) / 10,
        totalPeopleServed,
        community: {
          donors: donorsCount,
          ngos: ngosCount,
          volunteers: volunteersCount,
        },
      },
      categoryStats: categoryStats.map((item) => ({
        category: item._id,
        count: item.count,
        totalQuantity: item.totalQuantity,
      })),
      statusStats: statusStats.map((item) => ({
        status: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
};
