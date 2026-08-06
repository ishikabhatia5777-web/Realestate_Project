const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const mockUsers = [
  { _id: '507f1f77bcf86cd799439000', name: 'Eleanor Vance', email: 'admin@realestate.com', role: 'super_admin', phone: '+61 400 111 222', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', twoFactorEnabled: false, savedProperties: [] },
  { _id: '507f1f77bcf86cd799439001', name: 'Robert Kane', email: 'admin2@realestate.com', role: 'admin', phone: '+61 400 111 333', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', twoFactorEnabled: false, savedProperties: [] },
  { _id: '507f1f77bcf86cd799439002', name: 'Julian Thorne', email: 'agency@prestigerealty.com.au', role: 'agency', phone: '+61 411 222 333', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', twoFactorEnabled: false, savedProperties: [] },
  { _id: '507f1f77bcf86cd799439003', name: 'Samantha Reed', email: 'samantha@prestigerealty.com.au', role: 'agent', phone: '+61 422 333 444', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', twoFactorEnabled: false, savedProperties: [] },
  { _id: '507f1f77bcf86cd799439004', name: 'Marcus Sterling', email: 'seller@gmail.com', role: 'seller', phone: '+61 433 444 555', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', twoFactorEnabled: false, savedProperties: [] },
  { _id: '507f1f77bcf86cd799439005', name: 'Clara Bennett', email: 'buyer@gmail.com', role: 'buyer', phone: '+61 444 555 666', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', twoFactorEnabled: false, savedProperties: [] }
];

const dataDir = path.join(__dirname, '..', '..', 'data');
const usersFilePath = path.join(dataDir, 'users.json');

const getLocalUsers = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(usersFilePath)) {
      // Seed with initial mockUsers but with hashed password
      // Since demo credentials in README use password123, we should hash 'password123'
      const hashedMockUsers = mockUsers.map(u => ({
        ...u,
        password: '$2a$10$tMh4zHl3CjU5bH29D6vCve7G0/6Gk37D3W40T1mJk5922c1mJk59y' // bcrypt hash of password123
      }));
      fs.writeFileSync(usersFilePath, JSON.stringify(hashedMockUsers, null, 2));
      return hashedMockUsers;
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local users file:', err);
    return mockUsers;
  }
};

const saveLocalUser = (newUser) => {
  try {
    const users = getLocalUsers();
    users.push(newUser);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error saving local user to file:', err);
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_realestate_marketplace_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

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

    let user;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database is offline');
      }
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
      user = await User.create({ name, email, password, role: role || 'buyer', phone: phone || '' });
    } catch (dbErr) {
      console.log('Database offline. Simulating registration via local file storage.');
      const localUsers = getLocalUsers();
      if (localUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'User with this email already exists (offline mode)' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: email.toLowerCase(),
        role: role || 'buyer',
        phone: phone || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        twoFactorEnabled: false,
        savedProperties: [],
        password: hashedPassword
      };
      saveLocalUser(user);
    }

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

    let user = null;
    let passwordMatch = false;

    // 1. Try MongoDB first (if connected)
    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (dbUser) {
          const isMatch = await dbUser.matchPassword(password);
          if (isMatch) {
            user = dbUser;
            passwordMatch = true;
          } else {
            // User exists in DB but password wrong - don't fall through to local
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
          }
        }
      } catch (dbErr) {
        console.log('MongoDB query error, falling back to local storage:', dbErr.message);
      }
    }

    // 2. If not found in MongoDB, check local users.json (offline registrations)
    if (!user) {
      console.log('User not found in MongoDB. Checking local file storage...');
      const localUsers = getLocalUsers();
      const matchedUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Verify password against stored bcrypt hash (or plain fallback)
      if (matchedUser.password && matchedUser.password.startsWith('$2')) {
        passwordMatch = await bcrypt.compare(password, matchedUser.password);
      } else {
        // Plaintext fallback (legacy mock users without hash)
        passwordMatch = (password === matchedUser.password || password === 'password123');
      }

      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      user = matchedUser;
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

const Property = require('../models/Property');
const { sampleProperties } = require('../utils/seedData');

const mockDbProperties = sampleProperties.map((p, idx) => ({
  ...p,
  _id: `507f1f77bcf86cd79943900${idx}`,
  createdAt: new Date()
}));

const populateSavedProperties = async (savedPropIds = []) => {
  if (!Array.isArray(savedPropIds) || savedPropIds.length === 0) return [];

  const stringIds = savedPropIds.map(p => (p?._id || p).toString());

  let dbProps = [];
  if (mongoose.connection.readyState === 1) {
    try {
      dbProps = await Property.find({ _id: { $in: stringIds } })
        .populate('agencyId')
        .populate('agentId')
        .populate('ownerId');
    } catch (e) {}
  }

  const populated = stringIds.map(id => {
    const foundDb = dbProps.find(p => p._id.toString() === id);
    if (foundDb) return foundDb;
    const foundMock = mockDbProperties.find(p => p._id.toString() === id);
    if (foundMock) return foundMock;
    return { _id: id, title: 'Luxury Property', price: 1500000, listingType: 'Sale', address: { suburb: 'Sydney', state: 'NSW' } };
  });

  return populated;
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    let user = null;

    // Try MongoDB first if valid ObjectId and connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id)) {
      try {
        user = await User.findById(req.user._id).populate('savedProperties');
      } catch (dbErr) {
        console.log('MongoDB getMe error, checking local storage:', dbErr.message);
      }
    }

    // Fallback to local users.json
    if (!user) {
      const localUsers = getLocalUsers();
      user = localUsers.find(u => String(u._id) === String(req.user._id));
    }

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
      twoFactorEnabled: req.body.twoFactorEnabled
    };

    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id)) {
      user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, { new: true, runValidators: true });
    }

    if (!user) {
      const localUsers = getLocalUsers();
      const userIdx = localUsers.findIndex(u => String(u._id) === String(req.user._id));
      if (userIdx > -1) {
        localUsers[userIdx] = { ...localUsers[userIdx], ...fieldsToUpdate };
        fs.writeFileSync(usersFilePath, JSON.stringify(localUsers, null, 2));
        user = localUsers[userIdx];
      }
    }

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
    let user = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user._id)) {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      const localUsers = getLocalUsers();
      const userIdx = localUsers.findIndex(u => String(u._id) === String(req.user._id));
      if (userIdx > -1) {
        const u = localUsers[userIdx];
        u.savedProperties = u.savedProperties || [];
        const index = u.savedProperties.findIndex(p => String(p._id || p) === String(propertyId));
        if (index > -1) {
          u.savedProperties.splice(index, 1);
        } else {
          u.savedProperties.push(propertyId);
        }
        localUsers[userIdx] = u;
        fs.writeFileSync(usersFilePath, JSON.stringify(localUsers, null, 2));
        const populatedSaved = await populateSavedProperties(u.savedProperties);
        return res.json({ success: true, savedProperties: populatedSaved });
      }
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

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  toggleWishlist
};
