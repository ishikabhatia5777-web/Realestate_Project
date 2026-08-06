const mongoose = require('mongoose');
const { generateAIDescription, calculateAIValuation, analyzeListingFraud, processAIChat } = require('../utils/aiEngine');
const Property = require('../models/Property');

// @desc    Generate AI Property Description
// @route   POST /api/ai/generate-description
const generateDescription = async (req, res, next) => {
  try {
    const description = await generateAIDescription(req.body);
    res.json({ success: true, description });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Property Valuation Model
// @route   POST /api/ai/valuation
const getValuation = async (req, res, next) => {
  try {
    const valuation = calculateAIValuation(req.body);
    res.json({ success: true, valuation });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Listing Fraud Detection
// @route   POST /api/ai/fraud-check
const checkFraud = async (req, res, next) => {
  try {
    const analysis = analyzeListingFraud(req.body);
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Interactive Chatbot — fetches live property data as context
// @route   POST /api/ai/chat
const aiChat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // ── Fetch live property data from MongoDB to give AI real context ──────────
    let propertyContext = [];
    try {
      if (mongoose.connection.readyState === 1) {
        const properties = await Property.find({ status: 'Published' })
          .select('title propertyType listingType price pricePeriod bedrooms bathrooms parkingSpaces landArea floorArea address amenities features description tier')
          .limit(50)
          .lean();

        propertyContext = properties.map(p => ({
          id: p._id,
          title: p.title,
          type: p.propertyType,
          listing: p.listingType,
          price: p.price,
          pricePeriod: p.pricePeriod,
          beds: p.bedrooms,
          baths: p.bathrooms,
          parking: p.parkingSpaces,
          area: p.landArea || p.floorArea,
          suburb: p.address?.suburb,
          city: p.address?.city,
          state: p.address?.state,
          street: p.address?.street,
          tier: p.tier,
          amenities: p.amenities,
          features: p.features,
          description: p.description?.substring(0, 150)
        }));
      }
    } catch (dbErr) {
      console.log('AI: Could not fetch property context from DB:', dbErr.message);
    }

    if (!propertyContext || propertyContext.length === 0) {
      const { sampleProperties } = require('../utils/seedData');
      propertyContext = sampleProperties.map((p, idx) => ({
        id: `507f1f77bcf86cd799439${String(idx).padStart(3, '0')}`,
        _id: `507f1f77bcf86cd799439${String(idx).padStart(3, '0')}`,
        title: p.title,
        type: p.propertyType,
        listing: p.listingType,
        price: p.price,
        pricePeriod: p.pricePeriod,
        beds: p.bedrooms,
        baths: p.bathrooms,
        parking: p.parkingSpaces,
        area: p.landArea || p.floorArea,
        suburb: p.address?.suburb,
        city: p.address?.city,
        state: p.address?.state,
        street: p.address?.street,
        tier: p.tier,
        amenities: p.amenities,
        features: p.features,
        description: p.description?.substring(0, 150)
      }));
    }

    const response = await processAIChat(prompt, propertyContext);
    res.json({ success: true, response });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDescription,
  getValuation,
  checkFraud,
  aiChat
};
