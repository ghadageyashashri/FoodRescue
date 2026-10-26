const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [120, 'Food name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Food description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['cooked_meals', 'raw_ingredients', 'packaged_groceries', 'bakery', 'beverages', 'other'],
        message: '{VALUE} is not a valid category',
      },
      default: 'cooked_meals',
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['meals', 'kg', 'packets', 'boxes', 'liters', 'servings'],
      default: 'meals',
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    preparationDate: {
      type: Date,
      required: [true, 'Preparation date/time is required'],
    },
    useByDate: {
      type: Date,
      required: [true, 'Use-by date/time is required'],
      index: true,
    },
    storageConditions: {
      type: String,
      enum: ['ambient', 'refrigerated', 'frozen', 'hot_holding'],
      default: 'ambient',
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    pickupContactName: {
      type: String,
      trim: true,
      default: '',
    },
    pickupContactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'REQUESTED',
        'ACCEPTED',
        'PICKUP_ASSIGNED',
        'PICKED_UP',
        'DELIVERED',
        'RECEIVED',
        'DISTRIBUTED',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    peopleServed: {
      type: Number,
      default: 0,
      min: [0, 'People served cannot be negative'],
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check if donation is currently expired based on useByDate
donationSchema.virtual('isExpired').get(function () {
  return new Date() > this.useByDate && !['RECEIVED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED'].includes(this.status);
});

donationSchema.set('toJSON', { virtuals: true });
donationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Donation', donationSchema);
