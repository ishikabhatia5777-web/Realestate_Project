const Property = require('../models/Property');
const User = require('../models/User');
const Agency = require('../models/Agency');
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');
const ActivityLog = require('../models/ActivityLog');
const { sampleUsers, sampleAgencies, sampleProperties, sampleBlogs } = require('./seedData');

const autoSeedIfEmpty = async () => {
  try {
    const propCount = await Property.countDocuments();
    if (propCount > 0) {
      console.log(`ℹ️  Found ${propCount} properties in database. Auto-seed skipped.`);
      return;
    }

    console.log('🌱 Database is empty! Triggering automatic initial seed...');

    // Clear existing
    await User.deleteMany();
    await Agency.deleteMany();
    await Property.deleteMany();
    await Blog.deleteMany();
    await ActivityLog.deleteMany();
    await Booking.deleteMany();
    await Offer.deleteMany();

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const u = await User.create(userData);
      createdUsers.push(u);
    }

    const admin2User  = createdUsers.find(u => u.role === 'admin');
    const agencyOwner = createdUsers.find(u => u.role === 'agency');
    const agentUser   = createdUsers.find(u => u.role === 'agent');
    const sellerUser  = createdUsers.find(u => u.role === 'seller');
    const buyerUser   = createdUsers.find(u => u.role === 'buyer');

    const createdAgencies = [];
    for (let i = 0; i < sampleAgencies.length; i++) {
      const agencyData = {
        ...sampleAgencies[i],
        ownerId: i === 0 ? agencyOwner?._id : admin2User?._id
      };
      const agency = await Agency.create(agencyData);
      createdAgencies.push(agency);
    }

    if (agentUser && createdAgencies[0]) {
      await User.findByIdAndUpdate(agentUser._id, { agencyId: createdAgencies[0]._id });
      await User.findByIdAndUpdate(agencyOwner._id, { agencyId: createdAgencies[0]._id });
    }

    const createdProperties = [];
    for (let i = 0; i < sampleProperties.length; i++) {
      const propData = {
        ...sampleProperties[i],
        agencyId: createdAgencies[i % createdAgencies.length]?._id,
        agentId: agentUser?._id,
        ownerId: i % 3 === 0 ? sellerUser?._id : null
      };
      const property = await Property.create(propData);
      createdProperties.push(property);
    }

    if (createdProperties.length > 0 && buyerUser && agentUser) {
      await Booking.create({
        propertyId: createdProperties[0]._id,
        userId: buyerUser._id,
        agentId: agentUser._id,
        date: '2026-08-05',
        timeSlot: '11:00 AM',
        status: 'Confirmed',
        notes: 'Looking forward to the inspection.'
      });
      await Offer.create({
        propertyId: createdProperties[0]._id,
        buyerId: buyerUser._id,
        agentId: agentUser._id,
        offerAmount: 17500000,
        conditions: 'We are very interested. Please consider our offer.',
        status: 'Pending'
      });
    }

    if (sampleBlogs && sampleBlogs.length > 0) {
      await Blog.insertMany(sampleBlogs);
    }

    console.log(`✅ Automatic initial seeding completed! Seeded ${createdProperties.length} properties, ${createdUsers.length} users, and ${createdAgencies.length} agencies.`);
  } catch (err) {
    console.error('⚠️  Auto-seed error:', err.message);
  }
};

module.exports = autoSeedIfEmpty;
