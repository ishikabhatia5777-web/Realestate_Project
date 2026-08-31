const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Property = require('./src/models/Property');
const Agency = require('./src/models/Agency');

dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: 'ruhibhatia0022@gmail.com' });
    if (!user) {
      user = new User({
        name: 'ruhi',
        email: 'ruhibhatia0022@gmail.com',
        password: 'password123',
        role: 'seller',
        phone: '+91 9876543210'
      });
      await user.save();
      console.log('Created user:', user.email);
    } else {
      console.log('User already exists:', user.email);
    }

    // Try to get an agent and an agency
    const agent = await User.findOne({ role: 'agent' });
    const agency = await Agency.findOne();

    const properties = [
      {
        title: 'Modern Apartment in Downtown',
        description: 'A beautiful and modern apartment located in the heart of the city with excellent amenities.',
        propertyType: 'Apartment',
        listingType: 'Sale',
        price: 850000,
        address: {
          street: '123 Main St',
          suburb: 'Downtown',
          city: 'Metropolis',
          state: 'NY',
          postcode: '10001'
        },
        location: { type: 'Point', coordinates: [-74.006, 40.7128] },
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 1,
        landArea: 100,
        floorArea: 100,
        yearBuilt: 2021,
        status: 'Published',
        ownerId: user._id,
        agentId: agent ? agent._id : null,
        agencyId: agency ? agency._id : null
      },
      {
        title: 'Luxury Villa with Sea View',
        description: 'Exquisite villa featuring panoramic sea views, infinity pool, and premium amenities.',
        propertyType: 'Villa',
        listingType: 'Sale',
        price: 3500000,
        address: {
          street: '456 Ocean Drive',
          suburb: 'Coastal Bay',
          city: 'Metropolis',
          state: 'NY',
          postcode: '10002'
        },
        location: { type: 'Point', coordinates: [-73.935242, 40.730610] },
        bedrooms: 5,
        bathrooms: 6,
        parkingSpaces: 3,
        landArea: 500,
        floorArea: 350,
        yearBuilt: 2023,
        status: 'Published',
        ownerId: user._id,
        agentId: agent ? agent._id : null,
        agencyId: agency ? agency._id : null
      }
    ];

    for (const propData of properties) {
      const property = new Property(propData);
      await property.save();
      console.log('Created property:', property.title);
    }

    console.log('Successfully added properties for ruhibhatia0022@gmail.com');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

run();
