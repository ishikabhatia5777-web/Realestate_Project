const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');

dotenv.config();

const userProfiles = [
  { role: 'buyer', email: 'ishikabhatia5777@gmail.com', password: '123456', name: 'Ishika (Buyer)' },
  { role: 'seller', email: 'upvansh1234@gmail.com', password: '123456', name: 'Upvansh (Seller)' },
  { role: 'agent', email: 'ishikabhatia51@gmail.com', password: '123456', name: 'Ishika (Agent)' },
  { role: 'agency', email: 'upvanshk@gmail.com', password: '123456', name: 'Upvansh (Agency)' },
  { role: 'admin', email: 'ishbhatia484@gmail.com', password: '123456', name: 'Ishika (Admin)' },
  { role: 'agent', email: 'upansh769@gmail.com', password: '123456', name: 'Upansh (Agent)' },
  { role: 'agent', email: 'reet67711@gmail.com', password: '123456', name: 'Reet (Agent)' },
  { role: 'agent', email: 'ruhibhatia0022@gmail.com', password: '123456', name: 'Ruhi (Agent)' },
  { role: 'agent', email: 'saghun8699@gmail.com', password: '123456', name: 'Saghun (Agent)' }
];

// Expanded Australian Locations Data covering many areas
const locations = [
  // NSW - Sydney & Surrounds
  { state: 'NSW', city: 'Sydney', suburb: 'Point Piper', postcode: '2027', coordinates: [151.2514, -33.8683], type: 'coastal' },
  { state: 'NSW', city: 'Sydney', suburb: 'Barangaroo', postcode: '2000', coordinates: [151.2017, -33.8624], type: 'urban' },
  { state: 'NSW', city: 'Sydney', suburb: 'Bondi', postcode: '2026', coordinates: [151.2721, -33.8915], type: 'coastal' },
  { state: 'NSW', city: 'Sydney', suburb: 'Surry Hills', postcode: '2010', coordinates: [151.2117, -33.8860], type: 'urban' },
  { state: 'NSW', city: 'Sydney', suburb: 'Parramatta', postcode: '2150', coordinates: [151.0011, -33.8150], type: 'suburban' },
  { state: 'NSW', city: 'Sydney', suburb: 'Mosman', postcode: '2088', coordinates: [151.2420, -33.8285], type: 'coastal' },
  { state: 'NSW', city: 'Sydney', suburb: 'Newtown', postcode: '2042', coordinates: [151.1798, -33.8969], type: 'urban' },
  { state: 'NSW', city: 'Sydney', suburb: 'Cronulla', postcode: '2230', coordinates: [151.1528, -34.0573], type: 'coastal' },
  { state: 'NSW', city: 'Sydney', suburb: 'Manly', postcode: '2095', coordinates: [151.2828, -33.7963], type: 'coastal' },
  { state: 'NSW', city: 'Sydney', suburb: 'Penrith', postcode: '2750', coordinates: [150.6946, -33.7513], type: 'suburban' },
  // NSW - Regional
  { state: 'NSW', city: 'Newcastle', suburb: 'Merewether', postcode: '2291', coordinates: [151.7533, -32.9461], type: 'coastal' },
  { state: 'NSW', city: 'Newcastle', suburb: 'Hamilton', postcode: '2303', coordinates: [151.7454, -32.9238], type: 'urban' },
  { state: 'NSW', city: 'Wollongong', suburb: 'Fairy Meadow', postcode: '2519', coordinates: [150.8931, -34.3970], type: 'suburban' },
  { state: 'NSW', city: 'Byron Bay', suburb: 'Byron Bay', postcode: '2481', coordinates: [153.6119, -28.6474], type: 'coastal' },
  { state: 'NSW', city: 'Dubbo', suburb: 'Dubbo', postcode: '2830', coordinates: [148.6110, -32.2470], type: 'regional' },
  
  // VIC - Melbourne & Surrounds
  { state: 'VIC', city: 'Melbourne', suburb: 'South Yarra', postcode: '3141', coordinates: [144.9880, -37.8385], type: 'urban' },
  { state: 'VIC', city: 'Melbourne', suburb: 'Fitzroy', postcode: '3065', coordinates: [144.9786, -37.8010], type: 'urban' },
  { state: 'VIC', city: 'Melbourne', suburb: 'Brighton', postcode: '3186', coordinates: [144.9947, -37.9142], type: 'coastal' },
  { state: 'VIC', city: 'Melbourne', suburb: 'St Kilda', postcode: '3182', coordinates: [144.9818, -37.8640], type: 'coastal' },
  { state: 'VIC', city: 'Melbourne', suburb: 'Richmond', postcode: '3121', coordinates: [144.9976, -37.8230], type: 'urban' },
  { state: 'VIC', city: 'Melbourne', suburb: 'Frankston', postcode: '3199', coordinates: [145.1278, -38.1444], type: 'coastal' },
  { state: 'VIC', city: 'Melbourne', suburb: 'Dandenong', postcode: '3175', coordinates: [145.2158, -37.9863], type: 'suburban' },
  { state: 'VIC', city: 'Geelong', suburb: 'Newtown', postcode: '3220', coordinates: [144.3370, -38.1510], type: 'suburban' },
  { state: 'VIC', city: 'Ballarat', suburb: 'Wendouree', postcode: '3355', coordinates: [143.8228, -37.5350], type: 'regional' },
  { state: 'VIC', city: 'Bendigo', suburb: 'Bendigo', postcode: '3550', coordinates: [144.2800, -36.7570], type: 'regional' },

  // QLD - Brisbane, Gold Coast & Regional
  { state: 'QLD', city: 'Brisbane', suburb: 'New Farm', postcode: '4005', coordinates: [153.0480, -27.4646], type: 'urban' },
  { state: 'QLD', city: 'Brisbane', suburb: 'Indooroopilly', postcode: '4068', coordinates: [152.9730, -27.5020], type: 'suburban' },
  { state: 'QLD', city: 'Brisbane', suburb: 'Fortitude Valley', postcode: '4006', coordinates: [153.0336, -27.4566], type: 'urban' },
  { state: 'QLD', city: 'Brisbane', suburb: 'South Brisbane', postcode: '4101', coordinates: [153.0163, -27.4764], type: 'urban' },
  { state: 'QLD', city: 'Gold Coast', suburb: 'Surfers Paradise', postcode: '4217', coordinates: [153.4286, -28.0019], type: 'coastal' },
  { state: 'QLD', city: 'Gold Coast', suburb: 'Broadbeach', postcode: '4218', coordinates: [153.4305, -28.0315], type: 'coastal' },
  { state: 'QLD', city: 'Gold Coast', suburb: 'Sanctuary Cove', postcode: '4212', coordinates: [153.3644, -27.8542], type: 'coastal' },
  { state: 'QLD', city: 'Gold Coast', suburb: 'Burleigh Heads', postcode: '4220', coordinates: [153.4475, -28.0935], type: 'coastal' },
  { state: 'QLD', city: 'Sunshine Coast', suburb: 'Noosa Heads', postcode: '4567', coordinates: [153.0898, -26.3957], type: 'coastal' },
  { state: 'QLD', city: 'Sunshine Coast', suburb: 'Maroochydore', postcode: '4558', coordinates: [153.0903, -26.6500], type: 'coastal' },
  { state: 'QLD', city: 'Cairns', suburb: 'Edge Hill', postcode: '4870', coordinates: [145.7480, -16.9010], type: 'regional' },
  { state: 'QLD', city: 'Townsville', suburb: 'North Ward', postcode: '4810', coordinates: [146.8090, -19.2500], type: 'regional' },

  // WA - Perth & Regional
  { state: 'WA', city: 'Perth', suburb: 'Cottesloe', postcode: '6011', coordinates: [115.7533, -31.9961], type: 'coastal' },
  { state: 'WA', city: 'Perth', suburb: 'Subiaco', postcode: '6008', coordinates: [115.8236, -31.9482], type: 'urban' },
  { state: 'WA', city: 'Perth', suburb: 'Fremantle', postcode: '6160', coordinates: [115.7486, -32.0526], type: 'coastal' },
  { state: 'WA', city: 'Perth', suburb: 'Scarborough', postcode: '6019', coordinates: [115.7610, -31.8950], type: 'coastal' },
  { state: 'WA', city: 'Perth', suburb: 'Joondalup', postcode: '6027', coordinates: [115.7667, -31.7417], type: 'suburban' },
  { state: 'WA', city: 'Broome', suburb: 'Cable Beach', postcode: '6726', coordinates: [122.2150, -17.9350], type: 'coastal' },

  // SA - Adelaide & Regional
  { state: 'SA', city: 'Adelaide', suburb: 'Norwood', postcode: '5067', coordinates: [138.6335, -34.9213], type: 'urban' },
  { state: 'SA', city: 'Adelaide', suburb: 'Glenelg', postcode: '5045', coordinates: [138.5147, -34.9814], type: 'coastal' },
  { state: 'SA', city: 'Adelaide', suburb: 'North Adelaide', postcode: '5006', coordinates: [138.5960, -34.9080], type: 'urban' },
  { state: 'SA', city: 'Adelaide', suburb: 'Port Adelaide', postcode: '5015', coordinates: [138.5060, -34.8420], type: 'suburban' },
  { state: 'SA', city: 'Mount Gambier', suburb: 'Mount Gambier', postcode: '5290', coordinates: [140.7830, -37.8280], type: 'regional' },

  // TAS - Hobart & Regional
  { state: 'TAS', city: 'Hobart', suburb: 'Sandy Bay', postcode: '7005', coordinates: [147.3323, -42.9038], type: 'coastal' },
  { state: 'TAS', city: 'Hobart', suburb: 'Battery Point', postcode: '7004', coordinates: [147.3325, -42.8885], type: 'urban' },
  { state: 'TAS', city: 'Hobart', suburb: 'Glenorchy', postcode: '7010', coordinates: [147.2770, -42.8310], type: 'suburban' },
  { state: 'TAS', city: 'Launceston', suburb: 'Trevallyn', postcode: '7250', coordinates: [147.1186, -41.4429], type: 'regional' },

  // ACT - Canberra
  { state: 'ACT', city: 'Canberra', suburb: 'Braddon', postcode: '2612', coordinates: [149.1350, -35.2710], type: 'urban' },
  { state: 'ACT', city: 'Canberra', suburb: 'Belconnen', postcode: '2617', coordinates: [149.0664, -35.2384], type: 'suburban' },
  { state: 'ACT', city: 'Canberra', suburb: 'Tuggeranong', postcode: '2900', coordinates: [149.0880, -35.4160], type: 'suburban' },
  { state: 'ACT', city: 'Canberra', suburb: 'Kingston', postcode: '2604', coordinates: [149.1450, -35.3180], type: 'urban' },

  // NT - Darwin & Regional
  { state: 'NT', city: 'Darwin', suburb: 'Nightcliff', postcode: '0810', coordinates: [130.8521, -12.3820], type: 'coastal' },
  { state: 'NT', city: 'Darwin', suburb: 'Parap', postcode: '0820', coordinates: [130.8400, -12.4340], type: 'urban' },
  { state: 'NT', city: 'Alice Springs', suburb: 'Alice Springs', postcode: '0870', coordinates: [133.8807, -23.6980], type: 'regional' }
];

const propertyTypes = ['Residential', 'Villa', 'Apartment', 'Townhouse', 'Land', 'Commercial'];
const listingTypes = ['Sale', 'Rent'];
const streetNames = ['George', 'Victoria', 'King', 'Queen', 'High', 'Church', 'Macquarie', 'William', 'Main', 'Park', 'River', 'Beach', 'Ocean', 'Hill', 'Wattle', 'Gum'];
const streetSuffixes = ['Street', 'Road', 'Avenue', 'Lane', 'Boulevard', 'Drive', 'Court', 'Place'];
const amenitiesList = ['Swimming Pool', 'Gymnasium', 'Tennis Court', 'Balcony', 'Courtyard', 'Air Conditioning', 'Heating', 'Security System', 'Built-in Wardrobes', 'Dishwasher', 'Broadband Internet', 'Solar Panels', 'Ocean View', 'Park View', 'City View', 'Garage', 'Carport', 'Spa', 'Rumpus Room'];
const featuresList = ['Polished Timber Floors', 'Granite Benchtops', 'Gas Cooking', 'Double Glazed Windows', 'High Ceilings', 'Fireplace', 'Ensuite', 'Study', 'Outdoor Entertaining Area', 'Fully Fenced', 'Pet Friendly', 'Water Tank', 'Shed'];

const imagesPool = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
];

// Simple deterministic random generator (LCG)
let seed = 98765;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function getRandomItem(array) {
  return array[Math.floor(random() * array.length)];
}
function getRandomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function getRandomImages(count) {
  const images = [];
  const poolCopy = [...imagesPool];
  for (let i = 0; i < count; i++) {
    if (poolCopy.length === 0) break;
    const index = Math.floor(random() * poolCopy.length);
    images.push(poolCopy.splice(index, 1)[0]);
  }
  return images;
}

function generateProperty(index, ownerId, forcedLType, agencyId) {
  const loc = getRandomItem(locations);
  const pType = getRandomItem(propertyTypes);
  const lType = forcedLType;
  const stName = getRandomItem(streetNames);
  const stSuffix = getRandomItem(streetSuffixes);
  const stNum = getRandomInt(1, 999);
  
  const beds = pType === 'Land' ? 0 : getRandomInt(1, 6);
  const baths = pType === 'Land' ? 0 : Math.max(1, beds - getRandomInt(0, 2));
  const parking = pType === 'Land' ? 0 : getRandomInt(0, 3);
  
  let price = 0;
  let priceGuide = '';
  let pricePeriod = 'total';
  
  if (lType === 'Sale') {
    let basePrice = 400000;
    if (loc.city === 'Sydney') basePrice += 600000;
    if (loc.type === 'coastal') basePrice += 400000;
    if (pType === 'Villa') basePrice += 1000000;
    if (pType === 'Apartment') basePrice -= 200000;
    if (pType === 'Land') basePrice -= 250000;
    price = basePrice + (beds * 150000) + getRandomInt(-20, 20) * 10000;
    priceGuide = `Guide $${(price - 50000).toLocaleString()} - $${(price + 50000).toLocaleString()}`;
  } else {
    let basePrice = 350;
    if (loc.city === 'Sydney') basePrice += 250;
    if (loc.type === 'coastal') basePrice += 150;
    if (pType === 'Villa') basePrice += 500;
    if (pType === 'Apartment') basePrice -= 50;
    if (pType === 'Land') basePrice = 100;
    price = basePrice + (beds * 100) + getRandomInt(-10, 10) * 10;
    priceGuide = `$${price} per week`;
    pricePeriod = 'weekly';
  }

  // Slightly jitter the coordinates to prevent stacking
  const latJitter = (random() - 0.5) * 0.04;
  const lngJitter = (random() - 0.5) * 0.04;
  const coords = [loc.coordinates[0] + lngJitter, loc.coordinates[1] + latJitter];
  
  const selectedAmenities = [];
  if (pType !== 'Land') {
    for(let i = 0; i < getRandomInt(3, 8); i++) {
      const am = getRandomItem(amenitiesList);
      if (!selectedAmenities.includes(am)) selectedAmenities.push(am);
    }
  }

  const selectedFeatures = [];
  if (pType !== 'Land') {
    for(let i = 0; i < getRandomInt(2, 6); i++) {
      const f = getRandomItem(featuresList);
      if (!selectedFeatures.includes(f)) selectedFeatures.push(f);
    }
  }


  let titleAdjective = '';
  if (pType === 'Apartment') titleAdjective = getRandomItem(['Modern', 'Spacious', 'Luxury', 'Central', 'Renovated']);
  else if (pType === 'Villa') titleAdjective = getRandomItem(['Exclusive', 'Grand', 'Stunning', 'Prestigious', 'Waterfront']);
  else if (pType === 'Land') titleAdjective = getRandomItem(['Prime', 'Subdivision Potential', 'Scenic', 'Vacant']);
  else titleAdjective = getRandomItem(['Beautiful', 'Charming', 'Contemporary', 'Family', 'Classic']);
  
  const descPrefix = pType === 'Land' ? 'Build your dream home on this' : 'Experience the best of living in this';
  
  return {
    title: `${titleAdjective} ${pType} in ${loc.suburb}`,
    description: `${descPrefix} ${titleAdjective.toLowerCase()} ${pType.toLowerCase()} located in the heart of ${loc.suburb}. ${pType !== 'Land' ? `Featuring ${beds} spacious bedrooms, ${baths} well-appointed bathrooms, and a modern kitchen.` : 'A blank canvas waiting for your vision.'} Perfectly situated close to local amenities, schools, and transport in ${loc.state}. Don't miss out on this fantastic opportunity!`,
    propertyType: pType,
    listingType: lType,
    price: price,
    priceGuide: priceGuide,
    pricePeriod: pricePeriod,
    address: {
      street: `${stNum} ${stName} ${stSuffix}`,
      suburb: loc.suburb,
      city: loc.city,
      state: loc.state,
      postcode: loc.postcode,
      country: 'Australia'
    },
    location: {
      type: 'Point',
      coordinates: coords
    },
    bedrooms: beds,
    bathrooms: baths,
    parkingSpaces: parking,
    landArea: getRandomInt(300, 2000),
    floorArea: pType === 'Land' ? 0 : getRandomInt(60, 400),
    yearBuilt: pType === 'Land' ? null : getRandomInt(1980, 2024),
    energyRating: pType === 'Land' ? 0 : getRandomInt(3, 6),
    amenities: selectedAmenities,
    features: selectedFeatures,
    images: getRandomImages(getRandomInt(3, 6)),
    status: 'Published',
    agentId: ownerId, // Link to the user
    agencyId: agencyId || undefined,
    viewsCount: getRandomInt(10, 500)
  };
}

const seedLargeDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for large property seeding...');

    // 0. Clear all existing users to remove any unwanted dummy login data
    await User.deleteMany({});
    console.log(`🗑️  Cleared ALL old users to remove dummy logins.`);

    // 1. Create the specified users
    const createdUsers = {};
    for (const profile of userProfiles) {
      let user = await User.findOne({ email: profile.email });
      if (!user) {
        user = await User.create({
          name: profile.name,
          email: profile.email,
          password: profile.password,
          role: profile.role,
          isVerified: true
        });
        console.log(`   ✓ Created user: ${profile.email} as ${profile.role}`);
      }
      createdUsers[profile.email] = user;
    }

    // 2. Create the Agency document and link all agents to it
    const Agency = require('../models/Agency');
    const agencyOwner = createdUsers['upvanshk@gmail.com'];
    let agencyDoc = await Agency.findOne({ ownerId: agencyOwner._id });
    if (!agencyDoc) {
      agencyDoc = await Agency.create({
        name: 'Prestige Property Group',
        description: 'The top real estate agency in Australia.',
        licenseNumber: 'LIC123456789',
        ownerId: agencyOwner._id,
        isVerified: true
      });
      console.log(`   ✓ Created Agency document for upvanshk@gmail.com`);
    }

    // Link all agents to this agency
    for (const profile of userProfiles) {
      if (profile.role === 'agent') {
        const agentUser = createdUsers[profile.email];
        agentUser.agencyId = agencyDoc._id;
        await agentUser.save();
      }
    }

    // 3. Identify the users who should own properties (Seller, Agent, Agency)
    const propertyOwners = userProfiles
      .filter(p => ['seller', 'agent', 'agency'].includes(p.role))
      .map(p => createdUsers[p.email]._id);

    // 3. Clear ALL properties to reset the DB cleanly (as requested to have 100 properties exactly or similar)
    const deleteResult = await Property.deleteMany({});
    console.log(`🗑️  Cleared ALL ${deleteResult.deletedCount} old properties. Starting fresh.`);

    // 4. Generate properties (20 Sale + 20 Rent per owner = 120 total)
    const numProperties = propertyOwners.length * 40; 
    const propertiesData = [];
    let globalIndex = 0;
    
    for (const ownerId of propertyOwners) {
      // Find the user object to get their agencyId if any
      const userObj = Object.values(createdUsers).find(u => u._id.toString() === ownerId.toString());
      const agId = userObj ? userObj.agencyId : null;

      for (let i = 0; i < 20; i++) {
        propertiesData.push(generateProperty(globalIndex++, ownerId, 'Sale', agId));
      }
      for (let i = 0; i < 20; i++) {
        propertiesData.push(generateProperty(globalIndex++, ownerId, 'Rent', agId));
      }
    }

    // 5. Insert properties
    console.log(`⏳ Seeding ${numProperties} properties across all Australian states...`);
    const insertedProperties = await Property.insertMany(propertiesData);
    
    // 6. Generate Demo Offers (Removing Chat Generation as requested)
    console.log(`⏳ Seeding demo offers...`);
    const Offer = require('../models/Offer');
    const ContactRequest = require('../models/ContactRequest');
    
    await Offer.deleteMany({});
    await ContactRequest.deleteMany({});
    
    const offersData = [];
    
    for (const ownerId of propertyOwners) {
      const ownerProps = insertedProperties.filter(p => p.agentId.toString() === ownerId.toString());
      if (ownerProps.length === 0) continue;
      
      // Generate 5 offers for each agent's properties
      for(let i=0; i<5; i++) {
        const prop = getRandomItem(ownerProps);
        
        offersData.push({
          propertyId: prop._id,
          buyerId: createdUsers['ishikabhatia5777@gmail.com']._id,
          agentId: prop.agentId, // Tied specifically to this agent
          offerAmount: Math.floor(prop.price * 0.95),
          status: 'Pending'
        });
      }
    }
    
    await Offer.insertMany(offersData);
    
    console.log(`\n🏠 Successfully seeded ${numProperties} properties assigned to the Seller, Agent, and Agency.`);
    console.log(`💬 Successfully seeded ${offersData.length} offers.`);
    console.log('\n✅ ================================');
    console.log('   LARGE PROPERTY SEEDING COMPLETE!');
    console.log('   Users updated/created with password "123456":');
    userProfiles.forEach(p => console.log(`   - ${p.email} (${p.role})`));
    console.log('   Buyers will see ALL properties in the search.');
    console.log('✅ ================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedLargeDB();
