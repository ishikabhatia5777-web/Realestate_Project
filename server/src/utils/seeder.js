const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Agency = require('../models/Agency');
const Property = require('../models/Property');
const Blog = require('../models/Blog');
const ActivityLog = require('../models/ActivityLog');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');

const { sampleUsers, sampleAgencies, sampleProperties, sampleBlogs } = require('./seedData');

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear all collections
    await User.deleteMany();
    await Agency.deleteMany();
    await Property.deleteMany();
    await Blog.deleteMany();
    await ActivityLog.deleteMany();
    await Booking.deleteMany();
    await Offer.deleteMany();

    console.log('🗑️  Cleared old database records.');

    // Seed Users (all 6 roles)
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.name} [${user.role}]`);
    }
    console.log(`\n👥 Seeded ${createdUsers.length} Users across all roles.`);

    const adminUser   = createdUsers.find(u => u.role === 'super_admin');
    const admin2User  = createdUsers.find(u => u.role === 'admin');
    const agencyOwner = createdUsers.find(u => u.role === 'agency');
    const agentUser   = createdUsers.find(u => u.role === 'agent');
    const sellerUser  = createdUsers.find(u => u.role === 'seller');
    const buyerUser   = createdUsers.find(u => u.role === 'buyer');

    // Seed Agencies
    const createdAgencies = [];
    for (let i = 0; i < sampleAgencies.length; i++) {
      const agencyData = {
        ...sampleAgencies[i],
        ownerId: i === 0 ? agencyOwner._id : admin2User._id
      };
      const agency = await Agency.create(agencyData);
      createdAgencies.push(agency);
      console.log(`   ✓ Created agency: ${agency.name}`);
    }
    console.log(`\n🏢 Seeded ${createdAgencies.length} Agencies.`);

    // Attach agency to agent and agency owner
    await User.findByIdAndUpdate(agentUser._id, { agencyId: createdAgencies[0]._id });
    await User.findByIdAndUpdate(agencyOwner._id, { agencyId: createdAgencies[0]._id });

    // Seed Properties
    const createdProperties = [];
    for (let i = 0; i < sampleProperties.length; i++) {
      const propData = {
        ...sampleProperties[i],
        agencyId: createdAgencies[i % createdAgencies.length]._id,
        agentId: agentUser._id,
        ownerId: i % 3 === 0 ? sellerUser._id : null
      };
      const property = await Property.create(propData);
      createdProperties.push(property);
      console.log(`   ✓ Created property: ${property.title}`);
    }
    console.log(`\n🏠 Seeded ${createdProperties.length} Properties.`);

    // Seed sample Bookings (for agent and buyer)
    if (createdProperties.length > 0) {
      await Booking.create({
        propertyId: createdProperties[0]._id,
        userId: buyerUser._id,
        agentId: agentUser._id,
        date: '2026-08-05',
        timeSlot: '11:00 AM',
        status: 'Confirmed',
        notes: 'Looking forward to the inspection.'
      });
      await Booking.create({
        propertyId: createdProperties[1]._id,
        userId: buyerUser._id,
        agentId: agentUser._id,
        date: '2026-08-07',
        timeSlot: '02:00 PM',
        status: 'Pending',
        notes: 'Please confirm availability.'
      });
      console.log(`\n📅 Seeded 2 sample Bookings.`);
    }

    // Seed sample Offers
    if (createdProperties.length > 0) {
      await Offer.create({
        propertyId: createdProperties[0]._id,
        buyerId: buyerUser._id,
        agentId: agentUser._id,
        offerAmount: 17500000,
        conditions: 'We are very interested. Please consider our offer.',
        status: 'Pending'
      });
      await Offer.create({
        propertyId: createdProperties[1]._id,
        buyerId: buyerUser._id,
        agentId: agentUser._id,
        offerAmount: 12000000,
        conditions: 'Motivated buyer ready to move quickly.',
        status: 'Pending'
      });
      console.log(`\n💰 Seeded 2 sample Offers.`);
    }

    // Seed Blogs
    await Blog.insertMany(sampleBlogs);
    console.log(`\n📰 Seeded ${sampleBlogs.length} Blog articles.`);

    // Seed Activity Logs
    await ActivityLog.create({
      userId: adminUser._id,
      userName: adminUser.name,
      action: 'SYSTEM_SEED',
      details: `Database seeded successfully with ${createdUsers.length} users (all 6 roles), ${createdAgencies.length} agencies, ${createdProperties.length} properties, 2 bookings, 2 offers, and ${sampleBlogs.length} blog articles.`,
      level: 'info'
    });

    console.log('\n✅ ================================');
    console.log('   DATABASE SEEDING COMPLETE!');
    console.log('   Collections created in realestate_db:');
    console.log('   - users       (6 records - all roles)');
    console.log('   - agencies    (2 records)');
    console.log(`   - properties  (${createdProperties.length} records)`);
    console.log('   - bookings    (2 records)');
    console.log('   - offers      (2 records)');
    console.log(`   - blogs       (${sampleBlogs.length} records)`);
    console.log('   - activitylogs (1 record)');
    console.log('✅ ================================\n');
    console.log('   Demo Login Credentials:');
    console.log('   super_admin : admin@realestate.com      / password123');
    console.log('   admin       : admin2@realestate.com     / password123');
    console.log('   agency      : agency@prestigerealty.com.au / password123');
    console.log('   agent       : samantha@prestigerealty.com.au / password123');
    console.log('   seller      : seller@gmail.com          / password123');
    console.log('   buyer       : buyer@gmail.com           / password123');
    console.log('✅ ================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();
