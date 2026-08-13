const mongoose = require('mongoose');
const Agency = require('../models/Agency');
const User = require('../models/User');
const Property = require('../models/Property');
const { sampleAgencies } = require('../utils/seedData');

// Add mock ObjectIds to sample data for offline mode
const mockDbAgencies = sampleAgencies.map((a, idx) => ({
  ...a,
  _id: `507f1f77bcf86cd79943910${idx}`,
  ownerId: {
    name: 'Julian Thorne',
    email: 'agency@prestigerealty.com.au',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
  }
}));

// @desc    Get all agencies
// @route   GET /api/agencies
const getAgencies = async (req, res, next) => {
  try {
    let agencies = [];
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      agencies = await Agency.find().populate('ownerId', 'name email avatar');
    } catch (dbErr) {
      console.log('Database offline. Serving mock agencies fallback.');
      agencies = mockDbAgencies;
    }
    res.json({ success: true, count: agencies.length, agencies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single agency with agents & listings
// @route   GET /api/agencies/:id
const getAgencyById = async (req, res, next) => {
  try {
    let agency;
    let agents = [];
    let properties = [];

    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      agency = await Agency.findById(req.params.id).populate('ownerId', 'name email avatar phone');
      if (agency) {
        agents = await User.find({ agencyId: agency._id, role: 'agent' });
        properties = await Property.find({ agencyId: agency._id, status: 'Published' });
      }
    } catch (dbErr) {
      console.log('Database offline. Serving mock single agency details.');
      agency = mockDbAgencies.find(a => a._id === req.params.id) || mockDbAgencies[0];
      agents = [
        { _id: '507f1f77bcf86cd799439002', name: 'Ishika (Agent)', email: 'ishikabhatia51@gmail.com', role: 'agent' },
        { _id: '507f1f77bcf86cd799439005', name: 'Upansh (Agent)', email: 'upansh769@gmail.com', role: 'agent' },
        { _id: '507f1f77bcf86cd799439006', name: 'Reet (Agent)', email: 'reet67711@gmail.com', role: 'agent' },
        { _id: '507f1f77bcf86cd799439007', name: 'Ruhi (Agent)', email: 'ruhibhatia0022@gmail.com', role: 'agent' },
        { _id: '507f1f77bcf86cd799439008', name: 'Saghun (Agent)', email: 'saghun8699@gmail.com', role: 'agent' }
      ];
      properties = require('../utils/seedData').sampleProperties.map((p, idx) => ({
        ...p,
        _id: `mock_prop_${idx}`,
        agentId: agents[idx % agents.length]._id,
        agencyId: agency._id
      }));
    }

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    res.json({
      success: true,
      agency,
      agents,
      properties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Apply for Agency
// @route   POST /api/agencies
const createAgency = async (req, res, next) => {
  try {
    const { name, licenseNumber, phone, email } = req.body;
    if (!name || !licenseNumber || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Please provide all required agency fields' });
    }

    const agencyData = {
      ...req.body,
      ownerId: req.user._id
    };

    let agency;
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      agency = await Agency.create(agencyData);

      // Update user agency reference
      await User.findByIdAndUpdate(req.user._id, {
        agencyId: agency._id,
        role: 'agency',
        agencyVerificationStatus: 'pending'
      });
    } catch (dbErr) {
      agency = {
        ...agencyData,
        _id: `507f1f77bcf86cd7994391${Math.floor(Math.random() * 90 + 10)}`,
        status: 'pending',
        createdAt: new Date()
      };
      mockDbAgencies.unshift(agency);
    }

    res.status(201).json({ success: true, agency });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgencies,
  getAgencyById,
  createAgency
};
