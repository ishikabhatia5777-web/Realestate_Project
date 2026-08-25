const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/db');

async function migrateProperties() {
  try {
    await connectDB();
    console.log('--- Starting Data Migration ---');
    
    // We bypass Mongoose models for fetching to get the raw unstructured data
    const collection = mongoose.connection.db.collection('properties');
    
    const rawProperties = await collection.find({ title: { $exists: false } }).toArray();
    console.log(`Found ${rawProperties.length} properties needing migration...`);

    let count = 0;
    
    for (const raw of rawProperties) {
      // 1. Clean Price
      let cleanPrice = 500000; // default
      if (typeof raw.Price === 'number') {
          cleanPrice = raw.Price;
      } else if (typeof raw.Price === 'string') {
          const parsed = parseInt(raw.Price.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(parsed) && parsed > 0) cleanPrice = parsed;
      }

      // 2. Map Property Type to enum
      let pType = 'Residential';
      const rawType = (raw['Property Type'] || '').toLowerCase();
      if (rawType.includes('apartment') || rawType.includes('unit')) pType = 'Apartment';
      else if (rawType.includes('commercial')) pType = 'Commercial';
      else if (rawType.includes('land')) pType = 'Land';
      else if (rawType.includes('villa')) pType = 'Villa';
      else if (rawType.includes('townhouse')) pType = 'Townhouse';
      
      // 3. Create Title
      const title = raw.Address || `${pType} in ${raw['Suburb Name'] || 'City'}`;

      // 4. Transform to new schema
      const updateData = {
        title: title,
        description: raw.Description || `Beautiful ${pType} located at ${title}.`,
        propertyType: pType,
        listingType: 'Sale', // Default to sale
        price: cleanPrice,
        priceGuide: typeof raw.Price === 'string' ? raw.Price : '',
        address: {
          street: raw['Street Address'] || 'Unknown Street',
          suburb: raw['Suburb Name'] || 'Unknown Suburb',
          city: raw['Region Name'] || raw['Suburb Name'] || 'Unknown City',
          state: raw['State Code'] || 'ACT',
          postcode: String(raw.Postcode || '0000'),
          country: 'Australia'
        },
        bedrooms: Number(raw.Bedrooms) || 0,
        bathrooms: Number(raw.Bathrooms) || 0,
        parkingSpaces: Number(raw.Garages) || 0,
        status: 'Published', // Make them immediately visible!
        location: {
            type: 'Point',
            coordinates: [
                Number(raw.Longitude) || 151.2093,
                Number(raw.Latitude) || -33.8688
            ]
        }
      };

      // 5. Update the document in DB
      await collection.updateOne(
        { _id: raw._id },
        { $set: updateData }
      );
      
      count++;
      if (count % 200 === 0) console.log(`Migrated ${count} properties...`);
    }

    console.log(`\n✅ Migration Complete! Successfully mapped ${count} properties to the correct format.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
}

migrateProperties();
