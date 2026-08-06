const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Property description is required']
    },
    propertyType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Land', 'Villa', 'Apartment', 'Townhouse', 'Farm', 'Office', 'Warehouse'],
      required: true
    },
    listingType: {
      type: String,
      enum: ['Sale', 'Rent', 'Lease'],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    priceGuide: {
      type: String,
      default: ''
    },
    pricePeriod: {
      type: String,
      enum: ['total', 'weekly', 'monthly'],
      default: 'total'
    },
    address: {
      street: { type: String, required: true },
      suburb: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postcode: { type: String, required: true },
      country: { type: String, default: 'Australia' }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [151.2093, -33.8688] // Default Sydney coordinates
      }
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    parkingSpaces: { type: Number, default: 0 },
    landArea: { type: Number, default: 0 }, // sq metres
    floorArea: { type: Number, default: 0 }, // sq metres
    yearBuilt: { type: Number, default: 2020 },
    energyRating: { type: Number, default: 5 }, // 1 - 6 stars
    amenities: [{ type: String }],
    features: [{ type: String }],
    images: [{ type: String }],
    floorPlans: [{ type: String }],
    documents: [{ name: String, url: String }],
    virtualTourUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    inspectionDates: [
      {
        date: String,
        startTime: String,
        endTime: String
      }
    ],
    nearbyPoints: {
      schools: [{ name: String, distance: String }],
      hospitals: [{ name: String, distance: String }],
      transport: [{ name: String, distance: String }]
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Pending Review', 'Approved', 'Rejected', 'Published', 'Under Offer', 'Sold', 'Leased', 'Expired'],
      default: 'Pending Review'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    tier: {
      type: String,
      enum: ['Standard', 'Featured', 'Premium', 'Boosted'],
      default: 'Standard'
    },
    isBoosted: { type: Boolean, default: false },
    boostExpiresAt: { type: Date },
    viewsCount: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    aiEstimatedValue: { type: Number },
    aiFraudRiskScore: { type: Number, default: 5 }, // 0 to 100
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency'
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ title: 'text', description: 'text', 'address.suburb': 'text', 'address.city': 'text' });

module.exports = mongoose.model('Property', propertySchema);
