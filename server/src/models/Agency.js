const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide agency name'],
      trim: true
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    },
    description: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    phone: String,
    email: String,
    website: String,
    address: {
      street: String,
      suburb: String,
      city: String,
      state: String,
      postcode: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 4.8
    },
    reviewCount: {
      type: Number,
      default: 12
    },
    totalSales: {
      type: Number,
      default: 45
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agency', agencySchema);
