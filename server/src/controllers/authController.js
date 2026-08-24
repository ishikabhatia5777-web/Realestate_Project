const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ActivityLog = require('../models/ActivityLog');
const sendEmail = require('../utils/sendEmail');
const { sendEmail: sendEmailService } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_realestate_marketplace_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// In-memory OTP store for demo purposes (maps email to { otp, expires })
const otpStore = new Map();

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const storedOtpData = otpStore.get(email.toLowerCase());
    
    // For demo/testing purposes, allow "123456" as a master OTP
    const isMasterOtp = otp === '123456';
    const isStoredOtpValid = storedOtpData && storedOtpData.otp === otp && storedOtpData.expires > Date.now();

    if (!isMasterOtp && !isStoredOtpValid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear the OTP
    otpStore.delete(email.toLowerCase());

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        agencyId: user.agencyId,
        twoFactorEnabled: user.twoFactorEnabled,
        savedProperties: user.savedProperties || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, agencyId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a name' });
    }
    if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a password (min 6 characters)' });
    }

    const validRoles = ['super_admin', 'admin', 'agency', 'agent', 'seller', 'buyer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid role' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: `An account with ${email} already exists. Please sign in or use a different email address.` });
    }
    
    const user = await User.create({ name, email, password, role: role || 'buyer', phone: phone || '', agencyId: agencyId || null });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    try {
      await ActivityLog.create({
        userId: user._id,
        userName: user.name,
        action: 'USER_LOGIN',
        details: `User ${user.email} logged in.`,
        level: 'info'
      });
    } catch (logErr) {
      console.log('Failed to log login activity:', logErr.message);
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        agencyId: user.agencyId,
        twoFactorEnabled: user.twoFactorEnabled,
        savedProperties: user.savedProperties || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (to log activity)
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      try {
        await ActivityLog.create({
          userId: req.user._id,
          userName: req.user.name,
          action: 'USER_LOGOUT',
          details: `User ${req.user.email} logged out.`,
          level: 'info'
        });
      } catch (logErr) {
        console.log('Failed to log logout activity:', logErr.message);
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const Property = require('../models/Property');

const populateSavedProperties = async (savedPropIds = []) => {
  if (!Array.isArray(savedPropIds) || savedPropIds.length === 0) return [];
  const stringIds = savedPropIds.map(p => (p?._id || p).toString());

  let dbProps = [];
  try {
    dbProps = await Property.find({ _id: { $in: stringIds } })
      .populate('agencyId')
      .populate('agentId')
      .populate('ownerId');
  } catch (e) {}

  return dbProps;
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProperties');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Strip password before sending
    const { password: _pw, ...safeUser } = user.toObject ? user.toObject() : user;
    const populatedSaved = await populateSavedProperties(safeUser.savedProperties || []);

    res.json({ success: true, user: { ...safeUser, savedProperties: populatedSaved } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      avatar: req.body.avatar,
      twoFactorEnabled: req.body.twoFactorEnabled
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle saved property (Wishlist)
// @route   POST /api/auth/wishlist/:propertyId
const toggleWishlist = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.savedProperties = user.savedProperties || [];
    const index = user.savedProperties.findIndex(p => String(p._id || p) === String(propertyId));
    if (index > -1) {
      user.savedProperties.splice(index, 1);
    } else {
      user.savedProperties.push(propertyId);
    }

    await user.save();
    const populatedSaved = await populateSavedProperties(user.savedProperties);
    res.json({ success: true, savedProperties: populatedSaved });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password / Send OTP
// @route   POST /api/auth/forgotpassword
const forgotPassword = async (req, res, next) => {
  try {
    const emailInput = (req.body.email || '').trim().toLowerCase();

    if (!emailInput) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: emailInput });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    const otp = user.getResetPasswordToken();
    otpStore.set(emailInput, { otp, expires: Date.now() + 10 * 60 * 1000 });
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmailService({
        to: user.email,
        subject: '🔐 Your AuraEstates Login OTP',
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:14px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:24px 32px;border-bottom:2px solid #f59e0b;">
              <h1 style="margin:0;font-size:20px;color:#f59e0b;">🏡 AuraEstates</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">One-Time Login Code</p>
            </div>
            <div style="padding:32px;">
              <p>Hi <strong>${user.name || 'there'}</strong>,</p>
              <p>You requested to log in via OTP. Here is your one-time code:</p>
              <div style="background:#1e293b;border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
                <p style="margin:0;font-size:12px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">Your OTP Code</p>
                <p style="margin:8px 0 0;font-size:42px;font-weight:bold;color:#f59e0b;letter-spacing:10px;">${otp}</p>
                <p style="margin:8px 0 0;font-size:12px;color:#64748b;">⏱ Expires in 10 minutes</p>
              </div>
              <p style="font-size:13px;color:#94a3b8;">If you did not request this, please ignore this email.</p>
            </div>
            <div style="background:#1e293b;padding:14px 32px;border-top:1px solid #1e3a5f;">
              <p style="margin:0;font-size:11px;color:#475569;text-align:center;">Automated notification from AuraEstates — do not reply.</p>
            </div>
          </div>
        `
      });

      res.status(200).json({ success: true, data: 'OTP sent to email' });
    } catch (err) {
      console.error('[OTP] Email send failed, OTP in memory store:', err.message);
      console.log(`[OTP Demo] Code for ${emailInput}: ${otp}`);
      // Graceful degradation
      return res.status(200).json({ success: true, data: 'OTP generated. Email delivery may be delayed — use 123456 as demo OTP or check server logs.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
const verifyOtpAndLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const cleanEmail = email.trim().toLowerCase();
    // Get hashed OTP
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp.trim())
      .digest('hex');

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    try {
      await ActivityLog.create({
        userId: user._id,
        userName: user.name,
        action: 'USER_LOGIN_OTP',
        details: `User ${user.email} logged in via OTP.`,
        level: 'info'
      });
    } catch (logErr) {
      console.log('Failed to log login activity:', logErr.message);
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        agencyId: user.agencyId,
        twoFactorEnabled: user.twoFactorEnabled,
        savedProperties: user.savedProperties || []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  toggleWishlist,
  forgotPassword,
  verifyOtp,
  verifyOtpAndLogin
};
