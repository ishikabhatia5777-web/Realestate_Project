const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/db');

const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18efc2291?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1628012198051-50e8bc148d4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
];

async function addImages() {
  try {
    await connectDB();
    console.log('--- Starting Image Assignment ---');
    
    const collection = mongoose.connection.db.collection('properties');
    const properties = await collection.find({}).toArray();
    console.log(`Found ${properties.length} properties to update with images...`);

    let count = 0;
    
    for (const property of properties) {
      // Pick 2-3 random images
      const numImages = Math.floor(Math.random() * 2) + 2; 
      const shuffled = images.sort(() => 0.5 - Math.random());
      const selectedImages = shuffled.slice(0, numImages);

      await collection.updateOne(
        { _id: property._id },
        { $set: { images: selectedImages } }
      );
      
      count++;
      if (count % 200 === 0) console.log(`Updated images for ${count} properties...`);
    }

    console.log(`\n✅ Finished! Successfully assigned stunning images to all ${count} properties.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addImages();
