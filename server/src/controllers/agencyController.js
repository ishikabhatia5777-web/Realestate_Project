const mongoose = require('mongoose');
const Agency = require('../models/Agency');
const User = require('../models/User');
const Property = require('../models/Property');
const { sampleAgencies } = require('../utils/seedData');

// Mock agents for offline mode
const mockAgents = [
  {
    _id: '507f1f77bcf86cd799439101',
    name: 'Samantha Reed',
    email: 'samantha@prestigerealty.com.au',
    phone: '+61 422 333 444',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    bio: 'Award-winning agent with 10+ years in Sydney luxury real estate. Specialist in waterfront properties and high-rise apartments.',
    licenseNumber: 'NSW-AG-10012',
    specialties: ['Luxury Homes', 'Waterfront', 'Investments'],
    rating: 4.9,
    dealsCount: 148,
    location: 'Sydney, NSW',
    agencyName: 'Prestige Property Group'
  },
  {
    _id: '507f1f77bcf86cd799439102',
    name: 'Liam Carter',
    email: 'liam.carter@horizonrealty.com.au',
    phone: '+61 411 900 123',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    bio: 'Canberra-based specialist helping first-home buyers navigate the market with confidence. Transparent, honest and results-driven.',
    licenseNumber: 'ACT-AG-20034',
    specialties: ['First Home Buyers', 'Apartments', 'Suburbs'],
    rating: 4.8,
    dealsCount: 93,
    location: 'Canberra, ACT',
    agencyName: 'Horizon Real Estate Canberra'
  },
  {
    _id: '507f1f77bcf86cd799439103',
    name: 'Priya Sharma',
    email: 'priya@melbourneelite.com.au',
    phone: '+61 433 755 900',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?auto=format&fit=crop&q=80&w=400',
    bio: 'Melbourne's top-rated agent for inner-city living. Expert in off-the-plan projects and short-term investment yields.',
    licenseNumber: 'VIC-AG-30089',
    specialties: ['Off-the-Plan', 'Investments', 'Inner-City'],
    rating: 5.0,
    dealsCount: 211,
    location: 'Melbourne, VIC',
    agencyName: 'Melbourne Elite Properties'
  },
  {
    _id: '507f1f77bcf86cd799439104',
    name: 'Derek Walsh',
    email: 'derek@brisbanecoastal.com.au',
    phone: '+61 400 222 567',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Southeast Queensland coastal property guru. Specialising in holiday homes, beachfront blocks, and high-growth corridors.',
    licenseNumber: 'QLD-AG-40056',
    specialties: ['Coastal', 'Holiday Homes', 'Land'],
    rating: 4.7,
    dealsCount: 127,
    location: 'Brisbane, QLD',
    agencyName: 'Brisbane Coastal Realty'
  },
  {
    _id: '507f1f77bcf86cd799439105',
    name: 'Aisha Noor',
    email: 'aisha@perthpremium.com.au',
    phone: '+61 455 678 901',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    bio: 'Perth property expert with deep knowledge of the Western suburbs. Passionate about matching families with their forever homes.',
    licenseNumber: 'WA-AG-50023',
    specialties: ['Family Homes', 'Western Suburbs', 'Luxury'],
    rating: 4.9,
    dealsCount: 176,
    location: 'Perth, WA',
    agencyName: 'Perth Premium Realty'
  },
  {
    _id: '507f1f77bcf86cd799439106',
    name: 'Thomas Blake',
    email: 'thomas@adelaidehomes.com.au',
    phone: '+61 499 321 654',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    bio: 'Adelaide hills and wine country specialist. Helping buyers find acreage properties, vineyards and rural escapes since 2010.',
    licenseNumber: 'SA-AG-60011',
    specialties: ['Acreage', 'Rural', 'Wine Country'],
    rating: 4.8,
    dealsCount: 89,
    location: 'Adelaide, SA',
    agencyName: 'Adelaide Homes & Lifestyle'
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

// @desc    Get all agents (users with role='agent')
// @route   GET /api/agents
const getAgents = async (req, res, next) => {
  try {
    let agents = [];
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database offline');
      }
      agents = await User.find({ role: 'agent', isActive: true })
        .select('name email phone avatar bio licenseNumber role agencyId')
        .populate('agencyId', 'name');
    } catch (dbErr) {
      console.log('Database offline. Serving mock agents fallback.');
      agents = mockAgents;
    }
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
