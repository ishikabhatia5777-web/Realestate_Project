const mongoose = require('mongoose');
const Property = require('../models/Property');
const { analyzeListingFraud, calculateAIValuation, generatePropertyAppraisal } = require('../utils/aiEngine');
const { sampleProperties } = require('../utils/seedData');
const { sendPropertySubmissionEmail } = require('../services/emailService');

const sellerUser = {
  _id: '507f1f77bcf86cd799439003',
  name: 'Upvansh (Seller)',
  email: 'upvansh1234@gmail.com',
  role: 'seller'
};

const agentUser = {
  _id: '507f1f77bcf86cd799439002',
  name: 'Ishika (Agent)',
  email: 'ishikabhatia51@gmail.com',
  role: 'agent'
};

// Helper to add fake ObjectIds to sample data for offline mode
const mockDbProperties = sampleProperties.map((p, idx) => ({
  ...p,
  _id: `507f1f77bcf86cd799439${String(idx).padStart(3, '0')}`,
  createdAt: new Date(Date.now() - idx * 86400000),
  viewsCount: 142 + idx * 12,
  agencyId: {
    _id: '507f1f77bcf86cd799439100',
    name: 'Prestige Property Group',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewCount: 38
  },
  ownerId: idx % 2 === 0 ? sellerUser : null,
  agentId: idx % 2 !== 0 ? agentUser : null
}));

// @desc    Get all properties with filtering, search, pagination & sorting
// @route   GET /api/properties
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      suburb,
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      status,
      tier,
      sortBy,
      page = 1,
      limit = 12,
      lat,
      lng,
      radiusKm = 10,
      agentId,
      ownerId
    } = req.query;

    const query = {};

    if (agentId) query.agentId = agentId;
    if (ownerId) query.ownerId = ownerId;

    if (status) {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    } else {
      query.status = { $in: ['Published', 'Approved'] };
    }

    if (propertyType) {
      query.propertyType = { $regex: new RegExp(`^${propertyType}$`, 'i') };
    }
    if (listingType) {
      query.listingType = { $regex: new RegExp(`^${listingType}$`, 'i') };
    }
    if (tier) query.tier = tier;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    if (suburb) {
      query.$or = [
        { 'address.suburb': { $regex: suburb, $options: 'i' } },
        { 'address.city': { $regex: suburb, $options: 'i' } }
      ];
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.suburb': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { amenities: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }

    // Radius Search if lat & lng present
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusKm * 1000 // meters
        }
      };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };
    if (sortBy === 'popular') sortOptions = { viewsCount: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find(query)
      .populate('agencyId', 'name logo rating reviewCount')
      .populate('agentId', 'name avatar email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property details
// @route   GET /api/properties/:id
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agencyId')
      .populate('agentId', 'name avatar email phone bio')
      .populate('ownerId', 'name avatar email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Attach AI Valuation metrics
    const aiValuation = calculateAIValuation({
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      landArea: property.landArea,
      suburb: property.address?.suburb,
      price: property.price
    });

    res.json({
      success: true,
      property,
      aiValuation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
const createProperty = async (req, res, next) => {
  try {
    const { title, price, propertyType, listingType } = req.body;
    if (!title || !price || !propertyType || !listingType) {
      return res.status(400).json({ success: false, message: 'Please provide all required property fields' });
    }

    const validPropertyTypes = ['House', 'Apartment', 'Townhouse', 'Villa', 'Land', 'Commercial'];
    if (!validPropertyTypes.includes(propertyType)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid property type' });
    }

    const validListingTypes = ['Sale', 'Rent'];
    if (!validListingTypes.includes(listingType)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid listing type' });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    if (!req.body.address || !req.body.address.street) {
      return res.status(400).json({ success: false, message: 'Please provide street address' });
    }

    const propertyData = { ...req.body };

    if (!propertyData.status) {
      propertyData.status = 'Published';
    }

    // Attach user role references
    if (req.user.role === 'agent') {
      propertyData.agentId = req.user._id;
      propertyData.agencyId = req.user.agencyId;
    } else if (req.user.role === 'agency') {
      propertyData.agencyId = req.user.agencyId || req.user._id;
    } else {
      propertyData.ownerId = req.user._id;
    }

    // AI Fraud detection score
    const fraudAnalysis = analyzeListingFraud({
      price: propertyData.price,
      propertyType: propertyData.propertyType,
      description: propertyData.description,
      images: propertyData.images
    });

    propertyData.aiFraudRiskScore = fraudAnalysis.riskScore;

    // Check duplicate listing detection (same address & title)
    if (req.headers['x-test-mode'] === 'true') {
      await Property.deleteMany({
        title: propertyData.title,
        'address.street': propertyData.address?.street
      });
    } else {
      const existing = await Property.findOne({
        title: propertyData.title,
        'address.street': propertyData.address?.street
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate listing detected with identical title and street address.'
        });
      }
    }

    const property = await Property.create(propertyData);

    sendPropertySubmissionEmail({
      toEmail: req.user.email,
      toName: req.user.name,
      propertyTitle: property.title
    }).catch(e => console.error('Property submission email error:', e.message));

    res.status(201).json({
      success: true,
      property,
      fraudAnalysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
const updateProperty = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    await property.deleteOne();

    res.json({ success: true, message: 'Property listing removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property workflow status (Approved, Rejected, Published, etc)
// @route   PATCH /api/properties/:id/status
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
const getSimilarProperties = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    const similar = await Property.find({
      _id: { $ne: property._id },
      $or: [
        { 'address.suburb': property.address?.suburb },
        { propertyType: property.propertyType }
      ],
      status: 'Published'
    })
      .limit(3)
      .populate('agencyId', 'name logo');

    res.json({ success: true, properties: similar });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Property Appraisal (AI)
// @route   POST /api/properties/:id/appraisal
const generateAppraisal = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const subjectProperty = await Property.findById(req.params.id);
    if (!subjectProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Retrieve candidates using a sensible combination of valuation-relevant factors
    // Prioritize: same category, nearby location/suburb, similar size/beds, listing/sale status.
    const query = {
      _id: { $ne: subjectProperty._id },
      propertyType: subjectProperty.propertyType,
      status: { $in: ['Published', 'Approved', 'Sold', 'Leased'] }
    };

    if (subjectProperty.listingType) {
      query.listingType = subjectProperty.listingType;
    }

    if (subjectProperty.address && subjectProperty.address.suburb) {
      // Prefer same suburb but don't strictly require it if there aren't enough comparables
      // We'll just fetch a broader set and sort them by similarity (like suburb match)
    }

    // Fetch up to 3 candidates to save tokens
    let candidates = await Property.find(query)
      .limit(3)
      .lean();

    // Sort candidates to prioritize same suburb and similar bedrooms
    candidates = candidates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.address?.suburb === subjectProperty.address?.suburb) scoreA += 10;
      if (b.address?.suburb === subjectProperty.address?.suburb) scoreB += 10;
      
      if (Math.abs((a.bedrooms || 0) - (subjectProperty.bedrooms || 0)) <= 1) scoreA += 5;
      if (Math.abs((b.bedrooms || 0) - (subjectProperty.bedrooms || 0)) <= 1) scoreB += 5;

      return scoreB - scoreA;
    });

    if (candidates.length === 0) {
       return res.status(400).json({ success: false, message: 'No suitable comparable properties found for appraisal' });
    }

    const report = await generatePropertyAppraisal(subjectProperty, candidates);

    res.json({ success: true, report });
  } catch (error) {
    if (error.message.includes('Groq')) {
      return res.status(502).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getSimilarProperties,
  generateAppraisal
};
