const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Property = require('../models/Property');
const User = require('../models/User');
const { sendOfferRequestAlert, sendOfferStatusUpdate } = require('../services/emailService');

// @desc    Submit buying/renting offer
// @route   POST /api/offers
const createOffer = async (req, res, next) => {
  try {
    const { propertyId, offerAmount, depositAmount, conditions } = req.body;
    if (!offerAmount || offerAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Offer amount must be greater than zero' });
    }

    let offer;

    let propertyTitle = 'Luxury Property';
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      const property = await Property.findById(propertyId);
      if (property) {
        propertyTitle = property.title || propertyTitle;
      }

      offer = await Offer.create({
        propertyId,
        buyerId: req.user._id,
        agentId: property?.agentId?._id || property?.ownerId?._id,
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

    // Send Email notification directly to Admin
    const adminEmail = process.env.GMAIL_USER;
    let emailError = null;

    if (adminEmail) {
      try {
        console.log(`📧 [OFFER] Sending offer email to ${adminEmail} for property: ${propertyTitle}`);
        await sendOfferRequestAlert({
          toEmail: adminEmail,
          toName: 'Admin',
          buyerName: req.user.name || 'Buyer',
          buyerEmail: req.user.email || 'buyer@example.com',
          buyerPhone: req.user.phone || '',
          propertyTitle,
          propertyId,
          offerAmount,
          depositAmount: depositAmount || 10000,
          conditions: conditions || 'Subject to building inspection'
        });
        console.log('✅ Offer email sent!');
      } catch (err) {
        console.error('❌ Offer email error:', err.message);
        emailError = err.message;
      }
    } else {
      console.warn('⚠️ GMAIL_USER is not defined. Skipping guaranteed admin offer alert.');
      emailError = "Email System Error: GMAIL_USER is not defined in environment variables.";
    }

    const responsePayload = { success: true, offer };
    if (emailError) {
      responsePayload.emailError = emailError;
      responsePayload.message = "Offer was submitted successfully, but the email notification to the admin failed to send.";
    }

    res.status(201).json(responsePayload);
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
      console.log('Database error/offline. Serving empty offers.');
      offers = [];
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
    let buyerEmail = null;
    let buyerName = null;
    let propertyTitle = 'Property';
    let finalOfferAmount = counterAmount || 0;
    let finalStatus = action === 'accept' ? 'Accepted' : action === 'reject' ? 'Rejected' : 'Countered';

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

      // Populate buyer and property info for the email
      const populatedOffer = await Offer.findById(offer._id)
        .populate('propertyId', 'title')
        .populate('buyerId', 'name email');

      if (populatedOffer) {
        buyerEmail = populatedOffer.buyerId?.email || null;
        buyerName = populatedOffer.buyerId?.name || 'Buyer';
        propertyTitle = populatedOffer.propertyId?.title || 'Property';
        finalOfferAmount = populatedOffer.offerAmount || finalOfferAmount;
        finalStatus = populatedOffer.status;
      }
    } catch (dbErr) {
      console.warn('⚠️ [OFFER RESPOND] DB error, using fallback:', dbErr.message);
      offer = {
        _id: req.params.id,
        status: finalStatus,
        offerAmount: finalOfferAmount
      };

      // Attempt to look up buyer info even in fallback mode
      try {
        const offDoc = await Offer.findById(req.params.id);
        if (offDoc?.buyerId) {
          const buyer = await User.findById(offDoc.buyerId).select('name email');
          if (buyer) {
            buyerEmail = buyer.email;
            buyerName = buyer.name || 'Buyer';
          }
          if (offDoc.propertyId) {
            const prop = await Property.findById(offDoc.propertyId).select('title');
            propertyTitle = prop?.title || 'Property';
          }
          finalOfferAmount = offDoc.offerAmount || finalOfferAmount;
        }
      } catch (_) { /* ignore nested error */ }
    }

    // ─── Send email to buyer (accept / reject / counter) ────────────────────
    if (buyerEmail) {
      const actionLabel = action === 'accept' ? '✅ Accept' : action === 'reject' ? '❌ Reject' : '🔄 Counter';
      console.log(`📧 [OFFER ${actionLabel}] Sending status email to buyer: ${buyerEmail} — status: ${finalStatus}`);
      sendOfferStatusUpdate({
        toEmail: buyerEmail,
        toName: buyerName,
        propertyTitle,
        offerAmount: finalOfferAmount,
        status: finalStatus,
        counterAmount,
        note,
        updatedBy: req.user.name || 'Agent/Seller'
      })
        .then(() => console.log(`✅ Offer status email sent to ${buyerEmail}`))
        .catch(err => console.error('❌ Error sending offer status email:', err.message));
    } else {
      console.warn(`⚠️ [OFFER RESPOND] Could not find buyer email — skipping status email for offer ${req.params.id}`);
    }

    // ─── Return fully populated offer to frontend ────────────────────
    const returnedOffer = await Offer.findById(req.params.id)
      .populate('propertyId', 'title price address images listingType agentId ownerId')
      .populate('buyerId', 'name email phone avatar')
      .populate('agentId', 'name email phone');

    res.json({ success: true, offer: returnedOffer || offer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  getOffers,
  respondOffer
};
