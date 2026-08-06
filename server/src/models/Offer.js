const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    offerAmount: {
      type: Number,
      required: true
    },
    depositAmount: {
      type: Number,
      default: 10000
    },
    financeApproved: {
      type: Boolean,
      default: true
    },
    conditions: {
      type: String,
      default: 'Subject to building & pest inspection'
    },
    status: {
      type: String,
      enum: ['Pending', 'Countered', 'Accepted', 'Rejected', 'Withdrawn'],
      default: 'Pending'
    },
    counterOffers: [
      {
        offeredBy: { type: String, enum: ['buyer', 'agent', 'owner'] },
        amount: Number,
        note: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
