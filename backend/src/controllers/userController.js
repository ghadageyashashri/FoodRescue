const User = require('../models/User');

/**
 * Get all users with role filtering (Admin only)
 * GET /api/v1/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend or reactivate user (Admin only)
 * PATCH /api/v1/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;
    if (!['active', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid accountStatus. Must be active or suspended.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator account.' });
    }

    user.accountStatus = accountStatus;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account status updated to ${accountStatus}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
};
