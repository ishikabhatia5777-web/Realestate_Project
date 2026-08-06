const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    packageType: {
      type: String,
      enum: ['Featured Listing', 'Premium Listing', 'Boost Listing', 'Agency Pro Subscription', 'Holding Deposit', 'Property Deposit'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'AUD'
    },
    status: {
      type: String,
      enum: ['succeeded', 'pending', 'failed'],
      default: 'succeeded'
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card / Online Gateway'
    },
    stripePaymentIntentId: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
