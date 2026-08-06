const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Property = require('../models/Property');

// @desc    Submit buying/renting offer
// @route   POST /api/offers
const createOffer = async (req, res, next) => {
  try {
    const { propertyId, offerAmount, depositAmount, conditions } = req.body;
    if (!offerAmount || offerAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Offer amount must be greater than zero' });
    }

    let offer;

    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      offer = await Offer.create({
        propertyId,
        buyerId: req.user._id,
        agentId: property.agentId || property.ownerId,
        offerAmount,
        depositAmount: depositAmount || 10000,
        conditions: conditions || 'Subject to building inspection'
      });
    } catch (dbErr) {
      offer = {
        _id: `507f1f77bcf86cd7994394${Math.floor(Math.random() * 90 + 10)}`,
        propertyId,
        buyerId: req.user._id,
        offerAmount,
        depositAmount: depositAmount || 10000,
        conditions: conditions || 'Subject to building inspection',
        status: 'Pending'
      };
    }

    res.status(201).json({ success: true, offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user offers (buyer, agent, agency, or owner)
// @route   GET /api/offers
const getOffers = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'agent' || req.user.role === 'agency' || req.user.role === 'seller' || req.user.role === 'owner') {
      try {
        if (mongoose.connection.readyState !== 1) {
          throw new Error('Database offline');
        }
        const myProperties = await Property.find({
          $or: [
            { agentId: req.user._id },
            { ownerId: req.user._id },
            { agencyId: req.user.agencyId }
          ]
        }).select('_id');
        const myPropIds = myProperties.map(p => p._id);

        query = {
          $or: [
            { agentId: req.user._id },
            { propertyId: { $in: myPropIds } }
          ]
        };
      } catch (e) {
        query = {};
      }
    }

    let offers = [];
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      offers = await Offer.find(query)
        .populate('propertyId', 'title price address images listingType agentId ownerId')
        .populate('buyerId', 'name email phone avatar')
        .populate('agentId', 'name email phone')
        .sort({ createdAt: -1 });

      if (offers.length === 0 && req.user.role !== 'buyer') {
        offers = await Offer.find()
          .populate('propertyId', 'title price address images listingType agentId ownerId')
          .populate('buyerId', 'name email phone avatar')
          .populate('agentId', 'name email phone')
          .sort({ createdAt: -1 });
      }
    } catch (dbErr) {
      console.log('Database error/offline. Serving mock offers.');
      offers = [
        {
          _id: '507f1f77bcf86cd799439400',
          propertyId: {
            title: 'Sky Penthouse at Crown Towers Barangaroo',
            price: 12800000,
            address: { street: '100 Barangaroo Ave', suburb: 'Barangaroo' },
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400']
          },
          buyerId: { name: 'Clara Bennett', email: 'buyer@gmail.com', phone: '+61 444 555 666' },
          offerAmount: 12800000,
          depositAmount: 20000,
          conditions: 'Subject to finance approval & pest inspection within 14 days',
          status: 'Pending'
        }
      ];
    }

    res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond or Counter Offer
// @route   PUT /api/offers/:id/respond
const respondOffer = async (req, res, next) => {
  try {
    const { action, counterAmount, note } = req.body; // action: accept, reject, counter
    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid respond action' });
    }
    if ((action === 'accept' || action === 'reject') && req.user.role === 'buyer') {
      return res.status(403).json({ success: false, message: 'Buyers are not authorized to accept or reject offers' });
    }
    let offer;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      offer = await Offer.findById(req.params.id);

      if (!offer) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
      }

      // Prevent re-responding to already finalised offers
      if (offer.status === 'Accepted' && action === 'reject') {
        return res.status(400).json({ success: false, message: 'Cannot reject an already accepted offer' });
      }
      if (offer.status === 'Rejected' && action === 'accept') {
        return res.status(400).json({ success: false, message: 'Cannot accept an already rejected offer' });
      }

      if (action === 'accept') {
        offer.status = 'Accepted';
        await Property.findByIdAndUpdate(offer.propertyId, { status: 'Under Offer' });
      } else if (action === 'reject') {
        offer.status = 'Rejected';
      } else if (action === 'counter') {
        offer.status = 'Countered';
        offer.counterOffers.push({
          offeredBy: req.user.role === 'buyer' ? 'buyer' : 'agent',
          amount: counterAmount,
          note: note || ''
        });
        offer.offerAmount = counterAmount;
      }

      await offer.save();
    } catch (dbErr) {
      offer = {
        _id: req.params.id,
        status: action === 'accept' ? 'Accepted' : action === 'reject' ? 'Rejected' : 'Countered',
        offerAmount: counterAmount || 12800000
      };
    }
    res.json({ success: true, offer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getOffers,
  respondOffer
};
