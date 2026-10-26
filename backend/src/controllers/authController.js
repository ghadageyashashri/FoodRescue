const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'foodrescue_jwt_super_secret_key_development_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, address, organizationName, registrationNumber } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Role safety check: Admin role cannot be self-registered
    const userRole = role === 'admin' ? 'donor' : (role || 'donor');

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      phone,
      role: userRole,
      address: address || '',
    });

    let organization = null;
    // If NGO, create an organization profile
    if (userRole === 'ngo') {
      organization = await Organization.create({
        user: user._id,
        organizationName: organizationName || `${name}'s Relief Foundation`,
        registrationNumber: registrationNumber || '',
        address: address || 'Community Center, City',
        contactPerson: name,
        contactPhone: phone,
        verificationStatus: 'pending',
      });
    }

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        organization: organization || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration.',
      });
    }

    let organization = null;
    if (user.role === 'ngo') {
      organization = await Organization.findOne({ user: user._id });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        address: user.address,
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    let organization = null;
    if (req.user.role === 'ngo') {
      organization = await Organization.findOne({ user: req.user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        accountStatus: req.user.accountStatus,
        address: req.user.address,
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
