const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: String,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['In-Person', 'Video Tour'],
      default: 'In-Person'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
