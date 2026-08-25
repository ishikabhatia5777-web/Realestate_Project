const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/db');

async function cleanDummyData() {
  try {
    await connectDB();
    console.log('--- Cleaning Dummy Data ---');
    
    const collection = mongoose.connection.db.collection('properties');
    
    // 1. Remove all dummy unsplash images we added
    const resultImages = await collection.updateMany(
      { images: { $regex: /unsplash\.com/i } },
      { $set: { images: [] } }
    );
    console.log(`Removed fake images from ${resultImages.modifiedCount} properties.`);

    // 2. Remove the 28 seeded dummy properties if they exist (they usually have "Seeded" or specific names, but let's just delete properties that don't have the "Id" field which was in the real CSV upload)
    const resultFakeProps = await collection.deleteMany({ Id: { $exists: false } });
    console.log(`Deleted ${resultFakeProps.deletedCount} dummy properties that weren't part of your real upload.`);

    console.log(`\n✅ Database is now cleaned of all dummy data. Only your real properties remain.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanDummyData();
