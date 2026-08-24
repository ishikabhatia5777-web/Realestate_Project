const Agency = require('../models/Agency');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get all agencies
// @route   GET /api/agencies
const getAgencies = async (req, res, next) => {
  try {
    const agencies = await Agency.find().populate('ownerId', 'name email avatar');
    res.json({ success: true, count: agencies.length, agencies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single agency with agents & listings
// @route   GET /api/agencies/:id
const getAgencyById = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id).populate('ownerId', 'name email avatar phone');

    if (!agency) {
      return res.status(404).json({ success: false, message: 'Agency not found' });
    }

    const agents = await User.find({ agencyId: agency._id, role: 'agent' });
    const properties = await Property.find({ agencyId: agency._id, status: 'Published' });

    res.json({ success: true, agency, agents, properties });
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

    const agencyData = { ...req.body, ownerId: req.user._id };
    const agency = await Agency.create(agencyData);

    await User.findByIdAndUpdate(req.user._id, {
      agencyId: agency._id,
      role: 'agency',
      agencyVerificationStatus: 'pending'
    });

    res.status(201).json({ success: true, agency });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all agents (users with role='agent')
// @route   GET /api/agents
const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'agent', isActive: true })
      .select('name email phone avatar bio licenseNumber role agencyId')
      .populate('agencyId', 'name');
    res.json({ success: true, count: agents.length, agents });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAgencies, getAgencyById, createAgency, getAgents };
