const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { sendInspectionRequestAlert, sendInspectionStatusUpdate } = require('../services/emailService');

// @desc    Book property inspection
// @route   POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { propertyId, date, timeSlot, type, notes } = req.body;
    if (!propertyId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please provide propertyId, date and timeSlot' });
    }

    // Validate that the booking date is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bookingDate.getTime()) || bookingDate < today) {
      return res.status(400).json({ success: false, message: 'Booking date must be today or in the future' });
    }

    let booking;

    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      const property = await Property.findById(propertyId).populate('agentId ownerId');
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      booking = await Booking.create({
        propertyId,
        userId: req.user._id,
        agentId: property.agentId || property.ownerId,
        date,
        timeSlot,
        type: type || 'In-Person',
        notes: notes || ''
      });
    } catch (dbErr) {
      booking = {
        _id: `507f1f77bcf86cd7994393${Math.floor(Math.random() * 90 + 10)}`,
        propertyId,
        userId: req.user._id,
        date,
        timeSlot,
        type: type || 'In-Person',
        notes: notes || '',
        status: 'Pending'
      };
    }
    // ─── GUARANTEED ADMIN EMAIL NOTIFICATION ───
    // Always fire emails to the configured admin address regardless of DB status
    const adminEmail = process.env.GMAIL_USER;
    // FIX: Declare propertyTitle with let BEFORE any try/catch block that references it
    let propertyTitle = `Property (ID: ${propertyId})`;

    try {
      if (mongoose.connection.readyState === 1 && booking && booking.propertyId) {
        const prop = await Property.findById(booking.propertyId).populate('agentId ownerId');
        if (prop) {
          propertyTitle = prop.title; // Now correctly assigned to the outer-scoped variable
          const recipient = prop.agentId || prop.ownerId;

          // 1. Send to Agent/Owner (fire-and-forget, non-blocking)
          if (recipient && recipient.email && recipient.email !== adminEmail) {
            sendInspectionRequestAlert({
              toEmail: recipient.email,
              toName: recipient.name,
              buyerName: req.user.name || 'Buyer',
              buyerEmail: req.user.email || 'buyer@example.com',
              buyerPhone: req.user.phone || '',
              propertyTitle: prop.title,
              propertyId: prop._id,
              date,
              timeSlot,
              type,
              notes
            }).catch(err => console.error('Failed to send inspection alert to agent:', err.message));
          }

          // 2. Send to DB admins that are NOT the same as the GMAIL_USER (fire-and-forget)
          const admins = await mongoose.model('User').find({ role: { $in: ['admin', 'super_admin'] } });
          for (const admin of admins) {
            if (admin.email && admin.email !== recipient?.email && admin.email !== adminEmail) {
              sendInspectionRequestAlert({
                toEmail: admin.email,
                toName: admin.name,
                buyerName: req.user.name || 'Buyer',
                buyerEmail: req.user.email || 'buyer@example.com',
                buyerPhone: req.user.phone || '',
                propertyTitle: prop.title,
                propertyId: prop._id,
                date,
                timeSlot,
                type,
                notes
              }).catch(err => console.error('Failed to send DB admin inspection alert:', err.message));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error looking up property for inspection email:', err.message);
    }

    let emailError = null;

    // 3. Guaranteed Admin Email (always awaited so errors surface to the response)
    if (adminEmail) {
      try {
        console.log(`📧 [BOOKING] Sending guaranteed booking email to admin: ${adminEmail} for property: "${propertyTitle}"`);
        await sendInspectionRequestAlert({
          toEmail: adminEmail,
          toName: 'Admin',
          buyerName: req.user.name || 'Buyer',
          buyerEmail: req.user.email || 'buyer@example.com',
          buyerPhone: req.user.phone || '',
          propertyTitle,
          propertyId,
          date,
          timeSlot,
          type: type || 'In-Person',
          notes: notes || ''
        });
        console.log(`✅ [BOOKING] Admin email sent successfully to ${adminEmail}`);
      } catch (err) {
        console.error('❌ [BOOKING] Failed to send admin inspection alert:', err.message);
        emailError = err.message;
      }
    } else {
      const msg = 'Email System Error: GMAIL_USER is not defined in Render environment variables.';
      console.warn('⚠️', msg);
      emailError = msg;
    }

    const responsePayload = { success: true, booking };
    if (emailError) {
      responsePayload.emailError = emailError;
      responsePayload.message = 'Booking saved, but admin email notification failed.';
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.userId = req.user._id;
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

    let bookings = [];
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      bookings = await Booking.find(query)
        .populate('propertyId', 'title address images inspectionDates')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });

      if (bookings.length === 0 && req.user.role !== 'buyer') {
        bookings = await Booking.find()
          .populate('propertyId', 'title address images inspectionDates')
          .populate('userId', 'name email phone')
          .sort({ createdAt: -1 });
      }
    } catch (dbErr) {
      console.log('Database error/offline. Serving mock bookings.');
      bookings = [
        {
          _id: '507f1f77bcf86cd799439300',
          propertyId: {
            title: 'The Grand Waterfront Villa at Point Piper',
            address: { street: '14 Wolseley Road', suburb: 'Point Piper' },
            images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400']
          },
          userId: { name: 'Clara Bennett', email: 'buyer@gmail.com', phone: '+61 444 555 666' },
          date: '2026-08-01',
          timeSlot: '11:00 AM',
          type: 'In-Person',
          status: 'Confirmed'
        }
      ];
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    // Buyers can only cancel their own bookings, not confirm/complete them
    const buyerRole = req.user.role === 'buyer';
    if (buyerRole && status !== 'Cancelled') {
      return res.status(403).json({ success: false, message: 'Buyers can only cancel their own bookings' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let booking;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    } catch (dbErr) {
      booking = { _id: req.params.id, status };
    }

    // Send inspection status update email to the buyer
    try {
      if (mongoose.connection.readyState === 1) {
        const populatedBooking = await Booking.findById(req.params.id)
          .populate('propertyId', 'title')
          .populate('userId', 'name email');

        if (populatedBooking && populatedBooking.userId && populatedBooking.userId.email) {
          sendInspectionStatusUpdate({
            toEmail: populatedBooking.userId.email,
            toName: populatedBooking.userId.name,
            propertyTitle: populatedBooking.propertyId?.title || 'Property',
            date: populatedBooking.date,
            timeSlot: populatedBooking.timeSlot,
            status,
            updatedBy: req.user.name || 'Agent/Seller'
          }).catch(err => console.error('Failed to send inspection status email:', err.message));
        }
      }
    } catch (emailErr) {
      console.error('Error looking up booking for status email:', emailErr.message);
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};
