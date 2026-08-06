const mongoose = require('mongoose');
const Property = require('./src/models/Property');
const dotenv = require('dotenv');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await Property.countDocuments();
  console.log('Total Properties:', count);
  const sample = await Property.find({}).limit(5).select('title status listingType propertyType price');
  console.log('Sample Properties in DB:', JSON.stringify(sample, null, 2));
  process.exit(0);
}

check();
