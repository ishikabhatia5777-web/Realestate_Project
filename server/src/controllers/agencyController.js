const mongoose = require('mongoose');
const Agency = require('../models/Agency');
const User = require('../models/User');
const Property = require('../models/Property');
const { sampleAgencies } = require('../utils/seedData');

// Mock agents — includes real registered agents + sample agents for fallback
const mockAgents = [
  // ── Real registered agents in the system ──
  {
    _id: '507f1f77bcf86cd799439002',
    name: 'Ishika Bhatia',
    email: 'ishikabhatia51@gmail.com',
    phone: '+61 422 100 001',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    bio: 'Passionate real estate agent with a keen eye for premium properties. Dedicated to making every client\'s property journey smooth and rewarding.',
    licenseNumber: 'NSW-AG-10021',
    specialties: ['Luxury Homes', 'Apartments', 'Investments'],
    rating: 4.9,
    dealsCount: 64,
    location: 'Sydney, NSW',
    agencyName: 'Prestige Property Group'
  },
  {
    _id: '507f1f77bcf86cd799439005',
    name: 'Upansh Verma',
    email: 'upansh769@gmail.com',
    phone: '+61 411 200 002',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    bio: 'Results-driven agent specialising in first-home buyers and suburban growth corridors. Trusted advisor with a transparent, client-first approach.',
    licenseNumber: 'ACT-AG-20025',
    specialties: ['First Home Buyers', 'Suburbs', 'Land'],
    rating: 4.7,
    dealsCount: 48,
    location: 'Canberra, ACT',
    agencyName: 'Horizon Real Estate Canberra'
  },
  {
    _id: '507f1f77bcf86cd799439006',
    name: 'Reet Kapoor',
    email: 'reet67711@gmail.com',
    phone: '+61 433 300 003',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    bio: 'Melbourne specialist with expertise in off-the-plan developments and inner-city investments. Helping clients build wealth through smart property choices.',
    licenseNumber: 'VIC-AG-30036',
    specialties: ['Off-the-Plan', 'Inner-City', 'Investments'],
    rating: 4.8,
    dealsCount: 77,
    location: 'Melbourne, VIC',
    agencyName: 'Melbourne Elite Properties'
  },
  {
    _id: '507f1f77bcf86cd799439007',
    name: 'Ruhi Bhatia',
    email: 'ruhibhatia0022@gmail.com',
    phone: '+61 455 400 004',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?auto=format&fit=crop&q=80&w=400',
    bio: 'Brisbane coastal living expert. Specialising in holiday homes and beachfront properties with a passion for matching families with their dream lifestyle.',
    licenseNumber: 'QLD-AG-40047',
    specialties: ['Coastal', 'Holiday Homes', 'Family Homes'],
    rating: 5.0,
    dealsCount: 91,
    location: 'Brisbane, QLD',
    agencyName: 'Brisbane Coastal Realty'
  },
  {
    _id: '507f1f77bcf86cd799439008',
    name: 'Saghun Mehta',
    email: 'saghun8699@gmail.com',
    phone: '+61 499 500 005',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Perth luxury property specialist with a strong track record in premium Western suburb estates. Known for negotiating the best outcomes for clients.',
    licenseNumber: 'WA-AG-50058',
    specialties: ['Luxury', 'Western Suburbs', 'Acreage'],
    rating: 4.8,
    dealsCount: 53,
    location: 'Perth, WA',
    agencyName: 'Perth Premium Realty'
  }
];

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
    let agents = [];
    let properties = [];

    const agency = await Agency.findById(req.params.id).populate('ownerId', 'name email avatar phone');
    if (agency) {
      agents = await User.find({ agencyId: agency._id, role: 'agent' });
      properties = await Property.find({ agencyId: agency._id, status: 'Published' });
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

module.exports = {
  getAgencies,
  getAgencyById,
  createAgency,
  getAgents
};
