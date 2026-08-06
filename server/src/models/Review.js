const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetType: {
      type: String,
      enum: ['Agency', 'Agent'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    title: { type: String, default: '' },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
