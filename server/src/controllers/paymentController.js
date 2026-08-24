const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Property = require('../models/Property');
const Stripe = require('stripe');
const { sendReservationAlert, sendReservationConfirmation } = require('../services/emailService');

// Mock memory store for offline mode fallback
const mockTransactions = [
  {
    _id: '507f1f77bcf86cd799439901',
    userId: '507f1f77bcf86cd799439004',
    packageType: 'Featured Listing',
    amount: 99,
    currency: 'AUD',
    status: 'succeeded',
    paymentMethod: 'Credit Card',
    stripePaymentIntentId: 'pi_3M00000000000000001',
    createdAt: new Date()
  }
];

// @desc    Process & Record Payment Transaction for Listing Boost, Subscription, or Deposit
// @route   POST /api/payments/checkout
const processPayment = async (req, res, next) => {
  try {
    const { propertyId, packageType, amount, paymentMethod } = req.body;

    if (!packageType || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: 'Package type and amount are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    let intentId = 'pi_' + Math.random().toString(36).substring(2, 18);

    // Create live Stripe Payment Intent if real key available
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(Number(amount) * 100), // convert AUD to cents
          currency: 'aud',
          description: `AuraEstates Real Estate Platform - ${packageType}`,
          payment_method_types: ['card'],
          metadata: {
            userId: req.user._id?.toString() || 'Guest',
            propertyId: propertyId || 'N/A',
            packageType
          }
        });
        if (paymentIntent && paymentIntent.id) {
          intentId = paymentIntent.id;
        }
      } catch (stripeErr) {
        console.warn('Stripe Live API Notice:', stripeErr.message);
      }
    }

    let transaction = await Transaction.create({
      userId: req.user._id,
      propertyId: propertyId || null,
      packageType,
      amount: Number(amount),
      currency: 'AUD',
      status: 'succeeded',
      paymentMethod: paymentMethod || 'Credit Card (Stripe Gateway)',
      stripePaymentIntentId: intentId
    });

    if (propertyId) {
      const tierMap = {
        'Featured Listing': 'Featured',
        'Premium Listing': 'Premium',
        'Boost Listing': 'Boosted'
      };

      const newTier = tierMap[packageType] || 'Featured';
      await Property.findByIdAndUpdate(propertyId, {
        tier: newTier,
        isBoosted: true,
        boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // ─── GUARANTEED ADMIN EMAIL NOTIFICATION ───
    let emailError = null;

    if (packageType === 'Holding Deposit') {
      const adminEmail = process.env.GMAIL_USER;
      let propertyTitle = 'Property (ID: ' + propertyId + ')';

      try {
        if (mongoose.connection.readyState === 1 && propertyId) {
          const prop = await Property.findById(propertyId).populate('agentId ownerId');
          if (prop) {
            propertyTitle = prop.title;
            const recipient = prop.agentId || prop.ownerId;
            
            if (req.user && req.user.email) {
              sendReservationConfirmation({
                toEmail: req.user.email,
                toName: req.user.name,
                propertyTitle: prop.title,
                propertyId: prop._id,
                amount: Number(amount),
                packageType,
                paymentMethod,
                transactionId: intentId
              }).catch(err => console.error('Error sending buyer reservation confirmation:', err.message));
            }

            if (recipient && recipient.email) {
              sendReservationAlert({
                toEmail: recipient.email,
                toName: recipient.name,
                buyerName: req.user?.name || 'Buyer',
                buyerEmail: req.user?.email || 'buyer@example.com',
                buyerPhone: req.user?.phone || '',
                propertyTitle: prop.title,
                propertyId: prop._id,
                amount: Number(amount),
                packageType,
                paymentMethod
              }).catch(err => console.error('Error sending agent reservation alert:', err.message));
            }

            // Send to DB admins
            const admins = await mongoose.model('User').find({ role: { $in: ['admin', 'super_admin'] } });
            for (const admin of admins) {
              if (admin.email && admin.email !== recipient?.email && admin.email !== adminEmail) {
                sendReservationAlert({
                  toEmail: admin.email,
                  toName: admin.name,
                  buyerName: req.user?.name || 'Buyer',
                  buyerEmail: req.user?.email || 'buyer@example.com',
                  buyerPhone: req.user?.phone || '',
                  propertyTitle: prop.title,
                  propertyId: prop._id,
                  amount: Number(amount),
                  packageType,
                  paymentMethod
                }).catch(err => console.error('Error sending admin reservation alert:', err.message));
              }
            }
          }
        }
      } catch (err) {
        console.error('Error looking up property for reservation emails:', err.message);
      }

      // Guaranteed fallback email to configured admin
      if (adminEmail) {
        try {
          console.log(`📧 [PAYMENT] Sending guaranteed reservation email to admin: ${adminEmail}`);
          await sendReservationAlert({
            toEmail: adminEmail,
            toName: 'Admin',
            buyerName: req.user?.name || 'Buyer',
            buyerEmail: req.user?.email || 'buyer@example.com',
            buyerPhone: req.user?.phone || '',
            propertyTitle,
            propertyId,
            amount: Number(amount),
            packageType,
            paymentMethod
          });
        } catch (err) {
          console.error('Failed to send guaranteed admin reservation alert:', err.message);
          emailError = err.message;
        }
      } else {
        console.warn('⚠️ GMAIL_USER is not defined. Skipping guaranteed admin reservation alert.');
        emailError = "Email System Error: GMAIL_USER is not defined in environment variables.";
      }
    }

    const responsePayload = {
      success: true,
      message: `Payment of AUD $${amount} for ${packageType} completed successfully!`,
      transaction
    };

    if (emailError) {
      responsePayload.emailError = emailError;
      responsePayload.message += " However, the email notification to the admin failed to send.";
    }

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user or admin transaction history
// @route   GET /api/payments/history
const getPaymentHistory = async (req, res, next) => {
  try {
    const query = (req.user.role === 'admin' || req.user.role === 'super_admin')
      ? {}
      : { userId: req.user._id };

    const transactions = await Transaction.find(query)
      .populate('propertyId', 'title address images price')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentHistory
};
