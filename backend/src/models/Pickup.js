const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
      default: 'ASSIGNED',
      index: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    pickupNotes: {
      type: String,
      default: '',
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pickup', pickupSchema);
