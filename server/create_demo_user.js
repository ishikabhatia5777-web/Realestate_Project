const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Property = require('./src/models/Property');
const connectDB = require('./src/config/db');

async function run() {
  try {
    await connectDB();
    
    // 1. Get list of properties
    const propertyCount = await Property.countDocuments();
    console.log(`Total properties in database: ${propertyCount}`);
    
    if (propertyCount > 0) {
      const properties = await Property.find().limit(5).select('title price location.city status');
      console.log('\nSample properties:');
      console.table(properties.map(p => ({
        Title: p.title,
        Price: p.price,
        City: p.location?.city,
        Status: p.status
      })));
    } else {
      console.log('No properties found in the database. You might want to run the seed script: npm run seed');
    }

    // 2. Create demo user
    const demoEmail = 'demo@example.com';
    const existingUser = await User.findOne({ email: demoEmail });
    
    if (existingUser) {
        console.log(`\nDemo user already exists.`);
        console.log(`Email: ${demoEmail}`);
        console.log(`Password: (whatever was set previously, likely 'password123')`);
        console.log(`Role: ${existingUser.role}`);
    } else {
        console.log('\nCreating demo user...');
        const newUser = new User({
            name: 'Demo User',
            email: demoEmail,
            password: 'password123',
            role: 'buyer',
            isVerified: true
        });
        
        await newUser.save();
        console.log(`Demo user created successfully!`);
        console.log(`Email: ${demoEmail}`);
        console.log(`Password: password123`);
        console.log(`Role: buyer`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
