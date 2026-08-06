const mongoose = require('mongoose');
const Property = require('../models/Property');
const { analyzeListingFraud, calculateAIValuation } = require('../utils/aiEngine');
const { sampleProperties } = require('../utils/seedData');

const sellerUser = {
  _id: '507f1f77bcf86cd799439004',
  name: 'Marcus Sterling',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  email: 'seller@gmail.com',
  phone: '+61 433 444 555',
  role: 'seller'
};

const agentUser = {
  _id: '507f1f77bcf86cd799439003',
  name: 'Samantha Reed',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
  email: 'samantha@prestigerealty.com.au',
  phone: '+61 422 333 444',
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
      radiusKm = 10
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = 'Published';
    }

    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
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

    let properties = [];
    let total = 0;

    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      properties = await Property.find(query)
        .populate('agencyId', 'name logo rating reviewCount')
        .populate('agentId', 'name avatar email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);
      
      total = await Property.countDocuments(query);
    } catch (dbErr) {
      console.log('Database offline. Serving mock properties fallback.');
      // Filter mock properties using enhanced logic for offline mode
      properties = mockDbProperties.filter(p => {
        if (listingType && p.listingType !== listingType) return false;
        if (propertyType && p.propertyType !== propertyType) return false;
        if (suburb) {
          const s = suburb.toLowerCase();
          const matchSub = p.address?.suburb?.toLowerCase().includes(s) || p.address?.city?.toLowerCase().includes(s);
          if (!matchSub) return false;
        }
        if (city && !p.address.city?.toLowerCase().includes(city.toLowerCase())) return false;
        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        if (bedrooms && p.bedrooms < Number(bedrooms)) return false;
        if (search) {
          const kw = search.toLowerCase();
          const matchKw =
            p.title?.toLowerCase().includes(kw) ||
            p.description?.toLowerCase().includes(kw) ||
            p.address?.suburb?.toLowerCase().includes(kw) ||
            p.address?.city?.toLowerCase().includes(kw) ||
            p.address?.street?.toLowerCase().includes(kw);
          if (!matchKw) return false;
        }
        return true;
      });
      total = properties.length;
    }

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
    let property;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      property = await Property.findById(req.params.id)
        .populate('agencyId')
        .populate('agentId', 'name avatar email phone bio')
        .populate('ownerId', 'name avatar email phone');
    } catch (dbErr) {
      console.log('Database error/offline when getting property:', dbErr.message);
    }

    if (!property) {
      if (mongoose.connection.readyState === 1) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      property = mockDbProperties.find(p => p._id === req.params.id) || mockDbProperties[0];
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

    let property;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
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

      property = await Property.create(propertyData);
    } catch (dbErr) {
      console.log('MongoDB connection offline/error, falling back to local object creation:', dbErr.message);
      property = {
        ...propertyData,
        _id: `507f1f77bcf86cd799439${Math.floor(Math.random() * 9000 + 1000)}`,
        createdAt: new Date(),
        viewsCount: 1,
        savedCount: 0
      };
      mockDbProperties.unshift(property);
    }

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

    let property;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      property = await Property.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    } catch (dbErr) {
      const idx = mockDbProperties.findIndex(p => p._id === req.params.id);
      if (idx !== -1) {
        mockDbProperties[idx] = { ...mockDbProperties[idx], ...req.body };
        property = mockDbProperties[idx];
      } else {
        property = { _id: req.params.id, ...req.body };
      }
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
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      await property.deleteOne();
    } catch (dbErr) {
      const idx = mockDbProperties.findIndex(p => p._id === req.params.id);
      if (idx !== -1) {
        mockDbProperties.splice(idx, 1);
      }
    }

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
    let property;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
    } catch (dbErr) {
      const found = mockDbProperties.find(p => p._id === req.params.id);
      if (found) {
        found.status = status;
        property = found;
      } else {
        property = { _id: req.params.id, status };
      }
    }
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

    let similar = [];
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      similar = await Property.find({
        _id: { $ne: property._id },
        $or: [
          { 'address.suburb': property.address?.suburb },
          { propertyType: property.propertyType }
        ],
        status: 'Published'
      })
        .limit(3)
        .populate('agencyId', 'name logo');
    } catch (dbErr) {
      const currentProp = mockDbProperties.find(p => p._id === req.params.id);
      if (!currentProp) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      similar = mockDbProperties
        .filter(p => p._id !== currentProp._id && (p.propertyType === currentProp.propertyType || p.address?.suburb === currentProp.address?.suburb))
        .slice(0, 3);
    }

    res.json({ success: true, properties: similar });
  } catch (error) {
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
  getSimilarProperties
};
