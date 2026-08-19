const sampleUsers = [
  {
    _id: '507f1f77bcf86cd799439000',
    name: 'Eleanor Vance',
    email: 'admin@realestate.com',
    password: 'password123',
    role: 'super_admin',
    phone: '+61 400 111 222',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
  },
  {
    _id: '507f1f77bcf86cd799439001',
    name: 'Robert Kane',
    email: 'admin2@realestate.com',
    password: 'password123',
    role: 'admin',
    phone: '+61 400 111 333',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    _id: '507f1f77bcf86cd799439002',
    name: 'Julian Thorne',
    email: 'agency@prestigerealty.com.au',
    password: 'password123',
    role: 'agency',
    phone: '+61 411 222 333',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
  },
  {
    _id: '507f1f77bcf86cd799439003',
    name: 'Samantha Reed',
    email: 'samantha@prestigerealty.com.au',
    password: 'password123',
    role: 'agent',
    phone: '+61 422 333 444',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'
  },
  {
    _id: '507f1f77bcf86cd799439004',
    name: 'Marcus Sterling',
    email: 'seller@gmail.com',
    password: 'password123',
    role: 'seller',
    phone: '+61 433 444 555',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  },
  {
    _id: '507f1f77bcf86cd799439005',
    name: 'Clara Bennett',
    email: 'buyer@gmail.com',
    password: 'password123',
    role: 'buyer',
    phone: '+61 444 555 666',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  }
];

const sampleAgencies = [
  {
    name: 'Prestige Property Group',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    description: 'Australia’s premier luxury real estate agency specializing in waterfront estates, penthouse apartments, and architectural masterworks.',
    licenseNumber: 'NSW-RE-984210',
    phone: '+61 2 9234 5678',
    email: 'info@prestigerealty.com.au',
    website: 'https://prestigerealty.example.com',
    address: { street: '100 Barangaroo Avenue', suburb: 'Barangaroo', city: 'Sydney', state: 'NSW', postcode: '2000' },
    isVerified: true,
    rating: 4.9,
    reviewCount: 38,
    totalSales: 124
  },
  {
    name: 'Horizon Real Estate Canberra',
    logo: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    description: 'Trusted capital property specialists providing client-first sales, leasing, and property management across Canberra and the ACT.',
    licenseNumber: 'ACT-RE-441209',
    phone: '+61 2 6123 9900',
    email: 'contact@horizonre.example.com',
    website: 'https://horizonre.example.com',
    address: { street: '15 London Circuit', suburb: 'City Center', city: 'Canberra', state: 'ACT', postcode: '2601' },
    isVerified: true,
    rating: 4.8,
    reviewCount: 22,
    totalSales: 89
  }
];

const sampleProperties = [
  // POINT PIPER (3 properties)
  {
    title: 'The Grand Waterfront Villa at Point Piper',
    description: 'An architectural tour-de-force commanding sweeping panoramic Sydney Harbour and Bridge views. Designed by world-renowned architects, featuring infinity pool, private deep-water jetty, 6-car basement garage, home cinema, and smart automation throughout.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 18500000,
    priceGuide: 'Offers Over $1,800,000',
    address: { street: '14 Wolseley Road', suburb: 'Point Piper', city: 'Sydney', state: 'NSW', postcode: '2027' },
    location: { type: 'Point', coordinates: [151.2492, -33.8647] },
    bedrooms: 6,
    bathrooms: 7,
    parkingSpaces: 6,
    landArea: 1200,
    floorArea: 950,
    yearBuilt: 2023,
    energyRating: 6,
    amenities: ['Swimming Pool', 'Ocean View', 'Wine Cellar', 'Elevator', 'Home Theater', 'Smart Home System', 'Security System'],
    features: ['Marble Countertops', 'Custom Italian Joinery', 'Solar Panels', 'Ducted Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published',
    inspectionDates: [{ date: '2026-08-08', startTime: '11:00 AM', endTime: '11:45 AM' }]
  },
  {
    title: 'Point Piper Oceanfront Estate & Private Jetty',
    description: 'Ultra-exclusive harbourfront residence offering direct private deep-water mooring, heated infinity pool, championship tennis court, floor-to-ceiling glass pavilions, and custom marble wine vault.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 24000000,
    priceGuide: '$24,000,000 - $26,000,000',
    address: { street: '28 Wunulla Road', suburb: 'Point Piper', city: 'Sydney', state: 'NSW', postcode: '2027' },
    location: { type: 'Point', coordinates: [151.2480, -33.8655] },
    bedrooms: 7,
    bathrooms: 8,
    parkingSpaces: 8,
    landArea: 1550,
    floorArea: 1100,
    yearBuilt: 2024,
    energyRating: 6,
    amenities: ['Private Jetty', 'Tennis Court', 'Infinity Pool', 'Helipad Access', 'Wine Cellar', 'Spa & Sauna', 'Concierge Quarters'],
    features: ['Polished Calacatta Marble', 'Sub-Zero Appliances', 'Automated Blinds', 'Integrated Security'],
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published',
    inspectionDates: [{ date: '2026-08-09', startTime: '01:00 PM', endTime: '01:45 PM' }]
  },
  {
    title: 'Wolseley Haven Penthouse at Point Piper',
    description: 'Fully furnished luxury penthouse with direct views of the Sydney Harbour Bridge and Opera House. Features dual wraparound balconies, private internal elevator, and sub-penthouse concierge services.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    price: 4500,
    pricePeriod: 'weekly',
    priceGuide: '$4,500 / week',
    address: { street: '52 Wolseley Road', suburb: 'Point Piper', city: 'Sydney', state: 'NSW', postcode: '2027' },
    location: { type: 'Point', coordinates: [151.2501, -33.8639] },
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 320,
    floorArea: 320,
    yearBuilt: 2022,
    energyRating: 5,
    amenities: ['Harbour View', 'Private Elevator', 'Wraparound Terrace', 'Gymnasium', 'Concierge Service'],
    features: ['Designer Furniture', 'Gaggenau Kitchen', 'Fireplace', 'Smart Automation'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // BARANGAROO (2 properties)
  {
    title: 'Sky Penthouse at Crown Towers Barangaroo',
    description: 'Perched high above Sydney, this full-floor luxury penthouse offers floor-to-ceiling glass wrapping around uninterrupted 360-degree skyline and harbor vistas. Includes private spa, concierge service, and 24/7 valet parking.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 12800000,
    priceGuide: 'Contact Agent',
    address: { street: '1 Barangaroo Avenue', suburb: 'Barangaroo', city: 'Sydney', state: 'NSW', postcode: '2000' },
    location: { type: 'Point', coordinates: [151.2016, -33.8634] },
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    landArea: 540,
    floorArea: 540,
    yearBuilt: 2022,
    energyRating: 5,
    amenities: ['Sky Garden', 'Concierge', 'Valet Parking', 'Sauna', 'Gymnasium'],
    features: ['Miele Appliances', 'Chevron Timber Floors', 'Floor-to-Ceiling Windows'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published',
    inspectionDates: [{ date: '2026-08-08', startTime: '02:00 PM', endTime: '02:30 PM' }]
  },
  {
    title: 'Executive Waterfront Residence at Barangaroo Wharf',
    description: 'Sophisticated 2-bedroom executive apartment located directly on the Barangaroo foreshore. Step out to world-class dining, ferry terminal, and vibrant cultural dining precinct.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    price: 2200,
    pricePeriod: 'weekly',
    priceGuide: '$2,200 / week',
    address: { street: '88 Barangaroo Avenue', suburb: 'Barangaroo', city: 'Sydney', state: 'NSW', postcode: '2000' },
    location: { type: 'Point', coordinates: [151.2025, -33.8621] },
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    landArea: 145,
    floorArea: 145,
    yearBuilt: 2023,
    energyRating: 6,
    amenities: ['Water Frontage', '24/7 Security', 'Resident Lounge', 'High Speed Fibre Internet'],
    features: ['Built-in Robes', 'Ducted Air Conditioning', 'Integrated Dishwasher'],
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Standard',
    status: 'Published'
  },

  // BONDI BEACH (2 properties)
  {
    title: 'Bondi Beachfront Designer Penthouse',
    description: 'Immerse yourself in world-famous coastal views from this master-built oceanfront penthouse. Steps from Campbell Parade, featuring expansive entertainer deck, outdoor plunge pool, and timber sun loungers.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 4850000,
    priceGuide: '$4,700,000 - $5,000,000',
    address: { street: '120 Campbell Parade', suburb: 'Bondi Beach', city: 'Sydney', state: 'NSW', postcode: '2026' },
    location: { type: 'Point', coordinates: [151.2743, -33.8915] },
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    landArea: 210,
    floorArea: 210,
    yearBuilt: 2023,
    energyRating: 5,
    amenities: ['Oceanfront Terrace', 'Plunge Pool', 'Beach Access', 'Wine Fridge', 'Underfloor Heating'],
    features: ['Terrazzo Bathrooms', 'Oak Floorboards', 'Integrated Outdoor Grill'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published',
    inspectionDates: [{ date: '2026-08-08', startTime: '10:00 AM', endTime: '10:45 AM' }]
  },
  {
    title: 'Ben Buckler Cliffside Coastal Sanctuary',
    description: 'Perched dramatically above the Pacific Ocean at Ben Buckler point, this architectural triumph blends off-form concrete, natural cedar, and floor-to-ceiling sea glazing with acoustic soundproofing.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 7200000,
    priceGuide: 'Contact Agent',
    address: { street: '45 Ramsgate Avenue', suburb: 'Bondi Beach', city: 'Sydney', state: 'NSW', postcode: '2026' },
    location: { type: 'Point', coordinates: [151.2810, -33.8890] },
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    landArea: 480,
    floorArea: 390,
    yearBuilt: 2024,
    energyRating: 6,
    amenities: ['Panoramic Sea View', 'Subterranean Spa', 'Solar Battery Storage', 'Custom Sauna'],
    features: ['Boffi Kitchen', 'Motorized Louvers', 'Polished Concrete Floors'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published'
  },

  // MOSMAN (2 properties)
  {
    title: 'Balmoral Bay Architectural Masterpiece',
    description: 'Commanding prestigious position overlooking Balmoral Beach. Boasts solar-heated lap pool, internal glass elevator, master suite with dual dressing rooms, and automated smart garden system.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 14200000,
    priceGuide: '$14,000,000+',
    address: { street: '16 Balmoral Avenue', suburb: 'Mosman', city: 'Sydney', state: 'NSW', postcode: '2088' },
    location: { type: 'Point', coordinates: [151.2435, -33.8290] },
    bedrooms: 5,
    bathrooms: 5,
    parkingSpaces: 4,
    landArea: 890,
    floorArea: 680,
    yearBuilt: 2022,
    energyRating: 6,
    amenities: ['Balmoral Water View', 'Heated Lap Pool', 'Internal Elevator', 'Home Cinema', 'Wine Cellar'],
    features: ['French Oak Floors', 'Custom Joinery', 'Tesla Powerwall', 'Ducted Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published',
    inspectionDates: [{ date: '2026-08-09', startTime: '12:00 PM', endTime: '12:45 PM' }]
  },
  {
    title: 'Mosman Heritage Federation Residence',
    description: 'Meticulously restored Federation trophy home featuring soaring 3.8m ornate ceilings, Kauri pine flooring, manicured grounds, tennis court, and guest house cottage.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 6900000,
    priceGuide: '$6,750,000 - $7,100,000',
    address: { street: '72 Raglan Street', suburb: 'Mosman', city: 'Sydney', state: 'NSW', postcode: '2088' },
    location: { type: 'Point', coordinates: [151.2410, -33.8325] },
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 750,
    floorArea: 410,
    yearBuilt: 1912,
    energyRating: 4,
    amenities: ['Tennis Court', 'Manicured Lawns', 'Separate Guest House', 'Fireplaces', 'Verandah'],
    features: ['Original Stained Glass', 'Marble Fireplaces', 'Gas Kitchen', 'Attic Storage'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // DOUBLE BAY (2 properties)
  {
    title: 'French Provincial Manor in Double Bay',
    description: 'Exuding European elegance, this double-brick manor features limestone colonnades, private courtyard with water fountain, swimming pool, and proximity to Double Bay village boutiques.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 11500000,
    priceGuide: 'Contact Agent',
    address: { street: '34 Ocean Avenue', suburb: 'Double Bay', city: 'Sydney', state: 'NSW', postcode: '2028' },
    location: { type: 'Point', coordinates: [151.2415, -33.8770] },
    bedrooms: 5,
    bathrooms: 5,
    parkingSpaces: 4,
    landArea: 920,
    floorArea: 580,
    yearBuilt: 2021,
    energyRating: 5,
    amenities: ['Courtyard Fountain', 'Swimming Pool', 'Wine Cellar', 'Sauna', 'Security Gates'],
    features: ['Imported French Limestone', 'Chandelier Lighting', 'Wolf Range Oven'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },
  {
    title: 'Bay Street Luxury Townhouse in Double Bay',
    description: 'Designer three-level townhouse featuring direct street frontage, internal private lift, rooftop alfresco entertaining lounge, and underground double garage.',
    propertyType: 'Townhouse',
    listingType: 'Rent',
    price: 3200,
    pricePeriod: 'weekly',
    priceGuide: '$3,200 / week',
    address: { street: '18 Bay Street', suburb: 'Double Bay', city: 'Sydney', state: 'NSW', postcode: '2028' },
    location: { type: 'Point', coordinates: [151.2428, -33.8761] },
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 260,
    floorArea: 230,
    yearBuilt: 2023,
    energyRating: 5,
    amenities: ['Rooftop Deck', 'Internal Elevator', 'Walk to Village', 'Ducted AC'],
    features: ['Corian Countertops', 'Engineered Timber', 'Keyless Entry'],
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Standard',
    status: 'Published'
  },

  // BELLEVUE HILL (1 property)
  {
    title: 'Bellevue Hill Grand Colonial Estate',
    description: 'Stately Bellevue Hill residence set amidst 1,650sqm of sprawling gardens. Features a full tennis court, heated swimming pool, 6-bedroom accommodation, and city skyline views.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 21000000,
    priceGuide: 'Offers Over $2,000,000',
    address: { street: '8 Victoria Road', suburb: 'Bellevue Hill', city: 'Sydney', state: 'NSW', postcode: '2023' },
    location: { type: 'Point', coordinates: [151.2505, -33.8785] },
    bedrooms: 6,
    bathrooms: 6,
    parkingSpaces: 6,
    landArea: 1650,
    floorArea: 880,
    yearBuilt: 2020,
    energyRating: 5,
    amenities: ['Full Size Tennis Court', 'Swimming Pool', 'Skyline View', 'Cabana', 'Wine Cellar'],
    features: ['Granite Island Bench', 'High Ceilings', 'Security Perimeter Fence'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published'
  },

  // VAUCLUSE (1 property)
  {
    title: 'Vaucluse Cliffside Harbour View Mansion',
    description: 'Architectural wonder perched on the cliffline of Vaucluse. Enjoys unobstructed views across Sydney Heads and South Head lighthouse, complete with infinity plunge pool and glass elevator.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 19800000,
    priceGuide: '$19,500,000 - $21,000,000',
    address: { street: '55 Coolong Road', suburb: 'Vaucluse', city: 'Sydney', state: 'NSW', postcode: '2030' },
    location: { type: 'Point', coordinates: [151.2720, -33.8560] },
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 4,
    landArea: 1100,
    floorArea: 820,
    yearBuilt: 2023,
    energyRating: 6,
    amenities: ['Cliffside Infinity Pool', 'Ocean & Headland Views', 'Glass Elevator', 'Wine Vault'],
    features: ['Travertine Terraces', 'Integrated Sub-Zero Fridge', 'Solar Battery'],
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published'
  },

  // MANLY (1 property)
  {
    title: 'Manly Ocean Promenade Executive Suite',
    description: 'Front-row seat to Manly Beach ocean surf. Modern 3-bedroom apartment with oversized balcony, basement storage cage, surfboard wash bay, and resident gym access.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 3650000,
    priceGuide: '$3,500,000 - $3,800,000',
    address: { street: '14 North Steyne', suburb: 'Manly', city: 'Sydney', state: 'NSW', postcode: '2095' },
    location: { type: 'Point', coordinates: [151.2882, -33.7972] },
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    landArea: 180,
    floorArea: 180,
    yearBuilt: 2022,
    energyRating: 5,
    amenities: ['Ocean Frontage', 'Surfboard Storage', 'Gymnasium', 'Visitor Parking'],
    features: ['Timber Floorboards', 'Smart Air Con', 'Built-in BBQ'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // WOOLLAHRA (1 property)
  {
    title: 'Victorian Heritage Designer Terrace in Woollahra',
    description: 'Charming 3-bedroom Victorian terrace transformed by award-winning interior designers. Private internal courtyard garden, marble gas fireplace, and wine cellar storage.',
    propertyType: 'Townhouse',
    listingType: 'Sale',
    price: 4100000,
    priceGuide: '$4,000,000 - $4,250,000',
    address: { street: '42 Queen Street', suburb: 'Woollahra', city: 'Sydney', state: 'NSW', postcode: '2025' },
    location: { type: 'Point', coordinates: [151.2380, -33.8860] },
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 1,
    landArea: 220,
    floorArea: 260,
    yearBuilt: 1895,
    energyRating: 5,
    amenities: ['Courtyard Garden', 'Fireplace', 'Wine Cellar', 'Walk to Boutiques'],
    features: ['Herringbone Parquetry', 'Carrara Marble Kitchen', 'Attic Skylights'],
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // SOUTH YARRA (2 properties)
  {
    title: 'Contemporary Family Residence in South Yarra',
    description: 'A stylish 4-bedroom sanctuary in Melbourne’s prestigious South Yarra precinct. Merging classic Victorian facade with state-of-the-art modern interior expansion, landscaped zen garden, and heated lap pool.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 3450000,
    priceGuide: '$3,400,000 - $3,600,000',
    address: { street: '42 Domain Road', suburb: 'South Yarra', city: 'Melbourne', state: 'VIC', postcode: '3141' },
    location: { type: 'Point', coordinates: [144.985, -37.838] },
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 620,
    floorArea: 380,
    yearBuilt: 2021,
    energyRating: 5,
    amenities: ['Heated Pool', 'Outdoor BBQ Kitchen', 'Fireplace', 'Wine Cellar'],
    features: ['Hydronic Heating', 'Polished Concrete', 'Integrated Sonos Sound'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published',
    inspectionDates: [{ date: '2026-08-08', startTime: '10:00 AM', endTime: '10:30 AM' }]
  },
  {
    title: 'Domain Road Park View Apartment in South Yarra',
    description: 'Overlooking Royal Botanic Gardens, this bright 2-bedroom luxury residence offers north-facing balcony, secure parking, and concierge entrance.',
    propertyType: 'Apartment',
    listingType: 'Rent',
    price: 1100,
    pricePeriod: 'weekly',
    priceGuide: '$1,100 / week',
    address: { street: '98 Domain Road', suburb: 'South Yarra', city: 'Melbourne', state: 'VIC', postcode: '3141' },
    location: { type: 'Point', coordinates: [144.9865, -37.8372] },
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    landArea: 120,
    floorArea: 120,
    yearBuilt: 2022,
    energyRating: 6,
    amenities: ['Park View', 'Concierge', 'Secure Parking', 'Storage Unit'],
    features: ['Double Glazed Windows', 'Smeg Kitchen', 'Built-in Robes'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Standard',
    status: 'Published'
  },

  // TOORAK (1 property)
  {
    title: 'Toorak European Villa & Botanical Grounds',
    description: 'Set behind grand iron gates on Toorak’s finest street. Commands 1,400sqm of manicured Italianate gardens, indoor heated pool, 8-car basement showroom, and glass elevator.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 16500000,
    priceGuide: 'Contact Agent',
    address: { street: '12 St Georges Road', suburb: 'Toorak', city: 'Melbourne', state: 'VIC', postcode: '3142' },
    location: { type: 'Point', coordinates: [145.0080, -37.8420] },
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 5,
    landArea: 1400,
    floorArea: 820,
    yearBuilt: 2023,
    energyRating: 6,
    amenities: ['Indoor Swimming Pool', '8-Car Showroom Garage', 'Glass Elevator', 'Wine Tasting Room', 'Sauna'],
    features: ['Parquetry Floors', 'Imported Marble', 'Cbus Smart Control'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published'
  },

  // BRIGHTON (1 property)
  {
    title: 'Brighton Esplanade Beachside Mansion',
    description: 'Direct access to Brighton Beach bathing boxes. Features rooftop lounge terrace, infinity edge lap pool, state-of-the-art gym, and climate-controlled wine cellar.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 9400000,
    priceGuide: '$9,200,000 - $9,600,000',
    address: { street: '64 Esplanade', suburb: 'Brighton', city: 'Melbourne', state: 'VIC', postcode: '3186' },
    location: { type: 'Point', coordinates: [144.9920, -37.9060] },
    bedrooms: 5,
    bathrooms: 4,
    parkingSpaces: 4,
    landArea: 980,
    floorArea: 550,
    yearBuilt: 2022,
    energyRating: 5,
    amenities: ['Rooftop Lounge', 'Infinity Pool', 'Beach Access', 'Gymnasium', 'Wine Cellar'],
    features: ['Automated Sun Blinds', 'Gas Fireplace', 'Integrated Audio System'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // DOCKLANDS (1 property)
  {
    title: 'Docklands Marina Sky Villa & Private Boat Berth',
    description: 'Waterfront luxury living overlooking Victoria Harbour. Includes private 15m boat berth, dual balconies, concierge entrance, and indoor swimming pool access.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 2800000,
    priceGuide: '$2,700,000 - $2,900,000',
    address: { street: '180 Ocean Way', suburb: 'Docklands', city: 'Melbourne', state: 'VIC', postcode: '3008' },
    location: { type: 'Point', coordinates: [144.9450, -37.8180] },
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 240,
    floorArea: 240,
    yearBuilt: 2021,
    energyRating: 6,
    amenities: ['Private Boat Berth', 'Harbour Water View', 'Indoor Lap Pool', 'Concierge'],
    features: ['Stone Benches', 'European Laundry', 'Smart Intercom'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Standard',
    status: 'Published'
  },

  // SURFERS PARADISE (1 property)
  {
    title: 'Surfers Paradise Oceanfront Sky Villa',
    description: 'Uninterrupted 180-degree Pacific Ocean vistas from high-floor sub-penthouse. Includes private resort lagoon access, day spa, and 24-hour valet service.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 3250000,
    priceGuide: '$3,100,000 - $3,400,000',
    address: { street: '77 Esplanade', suburb: 'Surfers Paradise', city: 'Gold Coast', state: 'QLD', postcode: '4217' },
    location: { type: 'Point', coordinates: [153.4300, -28.0020] },
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 310,
    floorArea: 310,
    yearBuilt: 2023,
    energyRating: 5,
    amenities: ['Oceanfront View', 'Resort Lagoon Pool', 'Sauna & Spa', 'Valet Parking'],
    features: ['Floor-to-Ceiling Windows', 'Custom Wine Rack', 'Ducted Climate Control'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // SANCTUARY COVE (1 property)
  {
    title: 'Modern Waterfront Townhouse on the Gold Coast',
    description: 'Enjoy idyllic coastal living with this canal-front townhouse featuring private pontoon for vessel mooring, solar power, sun-drenched terrace, and designer kitchen.',
    propertyType: 'Townhouse',
    listingType: 'Rent',
    price: 1350,
    pricePeriod: 'weekly',
    priceGuide: '$1,350 / week',
    address: { street: '89 Masthead Way', suburb: 'Sanctuary Cove', city: 'Gold Coast', state: 'QLD', postcode: '4212' },
    location: { type: 'Point', coordinates: [153.364, -27.848] },
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    landArea: 310,
    floorArea: 240,
    yearBuilt: 2022,
    energyRating: 6,
    amenities: ['Private Boat Mooring', 'Tennis Court Access', 'Gated Community'],
    features: ['Waterfront Balcony', 'High Ceilings', 'Ducted AC'],
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Standard',
    status: 'Published'
  },

  // BROADBEACH WATERS (1 property)
  {
    title: 'Broadbeach Waters Luxury Canal Villa',
    description: 'Brand new single-level luxury canal residence. Features north-to-water aspect, private pontoon, glass-walled pool, and designer kitchen with butler pantry.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 4600000,
    priceGuide: '$4,500,000 - $4,800,000',
    address: { street: '14 Monaco Street', suburb: 'Broadbeach Waters', city: 'Gold Coast', state: 'QLD', postcode: '4218' },
    location: { type: 'Point', coordinates: [153.4210, -28.0330] },
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    landArea: 680,
    floorArea: 420,
    yearBuilt: 2024,
    energyRating: 6,
    amenities: ['Canal Water Frontage', 'Private Pontoon', 'Swimming Pool', 'Butler Pantry'],
    features: ['Polished Concrete', 'Integrated Barbecue', 'Solar Arrays'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // NOOSA HEADS (1 property)
  {
    title: 'Little Cove Ocean View Beach Sanctuary',
    description: 'Nestled between Noosa National Park and Little Cove Beach. Timber pavilion design with infinity pool into rainforest canopy and ocean breezes.',
    propertyType: 'Villa',
    listingType: 'Sale',
    price: 8900000,
    priceGuide: 'Contact Agent',
    address: { street: '22 Alderly Terrace', suburb: 'Noosa Heads', city: 'Sunshine Coast', state: 'QLD', postcode: '4567' },
    location: { type: 'Point', coordinates: [153.0900, -26.3950] },
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 3,
    landArea: 850,
    floorArea: 490,
    yearBuilt: 2023,
    energyRating: 6,
    amenities: ['Rainforest & Ocean Views', 'Infinity Pool', 'National Park Access', 'Solar Energy Storage'],
    features: ['Spotted Gum Timber Flooring', 'Custom Glass Walls', 'Louvre Ventilation'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published'
  },

  // COTTESLOE (1 property)
  {
    title: 'Cottesloe Beachfront Architectural Icon',
    description: 'Prime Cottesloe oceanfront position. Experience West Coast sunsets from multi-tiered limestone terraces, glass infinity spa, and open lounge.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 8200000,
    priceGuide: '$8,000,000 - $8,500,000',
    address: { street: '104 Marine Parade', suburb: 'Cottesloe', city: 'Perth', state: 'WA', postcode: '6011' },
    location: { type: 'Point', coordinates: [115.7510, -31.9940] },
    bedrooms: 5,
    bathrooms: 4,
    parkingSpaces: 3,
    landArea: 790,
    floorArea: 510,
    yearBuilt: 2022,
    energyRating: 5,
    amenities: ['Ocean Terrace', 'Glass Infinity Spa', 'Wine Vault', 'Home Gym'],
    features: ['Donnybrook Sandstone', 'Timber Battens', 'Keyless Automation'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // ASCOT (1 property)
  {
    title: 'Ascot Grand Queenslander Manor',
    description: 'Renovated classic Brisbane Queenslander blending wrap-around verandas, infinity pool, tennis court, and state-of-the-art chef kitchen in premier Ascot precinct.',
    propertyType: 'Residential',
    listingType: 'Sale',
    price: 4750000,
    priceGuide: '$4,600,000 - $4,900,000',
    address: { street: '55 Sutherland Avenue', suburb: 'Ascot', city: 'Brisbane', state: 'QLD', postcode: '4007' },
    location: { type: 'Point', coordinates: [153.0630, -27.4350] },
    bedrooms: 5,
    bathrooms: 4,
    parkingSpaces: 3,
    landArea: 1050,
    floorArea: 460,
    yearBuilt: 1928,
    energyRating: 5,
    amenities: ['Wrap-around Veranda', 'Infinity Pool', 'Tennis Court', 'Wine Cellar'],
    features: ['VJ Walls', 'Polished Hoop Pine Floors', 'Marble Island Bench'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Featured',
    status: 'Published'
  },

  // CANBERRA CITY (1 property)
  {
    title: 'London Circuit Executive Penthouse',
    description: 'High-floor executive penthouse in Canberra CBD with panoramic Lake Burley Griffin views, private balcony, dual secure parking, and concierge entry.',
    propertyType: 'Apartment',
    listingType: 'Sale',
    price: 1950000,
    priceGuide: '$1,900,000 - $2,050,000',
    address: { street: '15 London Circuit', suburb: 'City Center', city: 'Canberra', state: 'ACT', postcode: '2601' },
    location: { type: 'Point', coordinates: [149.1287, -35.2809] },
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    landArea: 195,
    floorArea: 195,
    yearBuilt: 2022,
    energyRating: 6,
    amenities: ['Lake View', 'Concierge', 'Gymnasium', 'EV Charging Station'],
    features: ['Double Glazing', 'European Appliances', 'Smart Lighting'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Standard',
    status: 'Published'
  },

  // BYRON BAY (1 property)
  {
    title: 'Byron Bay Hinterland Eco Luxury Estate',
    description: 'Set across 18 rolling green acres in the Byron Bay hinterland. Features natural swimming billabong, organic citrus grove, yoga pavilion, and off-grid solar tech.',
    propertyType: 'Farm',
    listingType: 'Sale',
    price: 7800000,
    priceGuide: '$7,500,000 - $8,000,000',
    address: { street: '120 Coopers Shoot Road', suburb: 'Byron Bay', city: 'Byron Bay', state: 'NSW', postcode: '2481' },
    location: { type: 'Point', coordinates: [153.6120, -28.6470] },
    bedrooms: 5,
    bathrooms: 4,
    parkingSpaces: 4,
    landArea: 18000,
    floorArea: 620,
    yearBuilt: 2023,
    energyRating: 6,
    amenities: ['Natural Swimming Billabong', 'Organic Farm & Citrus', 'Yoga Pavilion', '100% Off-Grid Solar'],
    features: ['Rammed Earth Walls', 'Recycled Hardwood', 'Rainwater Harvest Systems'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    tier: 'Premium',
    status: 'Published'
  }
];

const sampleBlogs = [
  {
    title: 'Australian Property Market Outlook 2026: Trends & Growth Suburbs',
    slug: 'australian-property-market-outlook-2026',
    excerpt: 'An in-depth analysis of interest rate trajectory, suburb price performance, and key demographic shifts shaping 2026 luxury real estate.',
    content: 'The Australian housing market has shown resilient performance entering 2026 with strong demand driven by low inventory levels and high international migration. Prime waterfront precincts across Sydney, Melbourne, and South-East Queensland continue to lead price appreciation. Capital growth has accelerated in coastal corridors as high-net-worth buyers prioritize lifestyle amenities, eco-efficiency, and smart home technology. Market clearance rates across capital cities currently hover around 74.8%, signaling sustained market strength.',
    category: 'Market Insights',
    author: 'Chief Economist Editorial',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min read',
    featured: true
  },
  {
    title: 'Top 5 Renovation Projects That Boost Property Valuation',
    slug: 'top-5-renovation-projects-property-valuation',
    excerpt: 'Discover which high-end home upgrades yield the highest ROI when preparing your premium residential listing for auction.',
    content: 'When preparing to sell a luxury residence, strategic renovations dramatically increase buyer competition and push auction bids higher. Open-plan kitchen modernizations with stone waterfall islands, architectural landscape lighting, smart home automation, and energy-efficient solar plus storage systems lead the market in return on investment. Buyers in 2026 are willing to pay a premium for turnkey move-in ready residences.',
    category: 'Sellers Guide',
    author: 'Design & Living Team',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read'
  },
  {
    title: 'Why Commercial Real Estate is Rebounding in Q3 2026',
    slug: 'why-commercial-real-estate-rebounding-q3-2026',
    excerpt: 'Institutional investors are returning to prime CBD office towers and boutique retail hubs across Sydney and Melbourne.',
    content: 'Commercial property investments are undergoing a structural resurgence as premium office spaces pivot toward high-amenity workplace experiences. Flexible executive suites, wellness spaces, and ESG-compliant green building designs are commanding premium rental yields. Institutional syndicates are actively targeting flagship assets in core financial districts.',
    category: 'Investment Analysis',
    author: 'Financial Advisory Hub',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    readTime: '6 min read'
  },
  {
    title: 'Architectural Trends: Biophilic Luxury & Sustainable Penthouses',
    slug: 'architectural-trends-biophilic-luxury-penthouses',
    excerpt: 'How leading Australian architects are blending native greenery, cross-ventilation, and subterranean wellness spaces in ultra-luxury builds.',
    content: 'Biophilic design has evolved from a niche preference into an essential element of modern luxury architecture. Multi-million dollar penthouses and waterfront villas are incorporating living green walls, natural timber acoustics, thermal massing, and private rainwater reclamation systems. Buyers seek environments that promote physical wellness and seamlessly integrate nature into urban high-rises.',
    category: 'Architecture & Design',
    author: 'Architectural Digest Syndicate',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
    readTime: '7 min read'
  },
  {
    title: 'Navigating Property Tax Changes & Foreign Buyer Regulations',
    slug: 'navigating-property-tax-changes-foreign-buyer-regulations',
    excerpt: 'Essential updates on stamp duty concessions, land tax thresholds, and compliance for domestic and overseas investors.',
    content: 'Navigating real estate taxation requires staying updated with federal and state regulatory amendments. Recent changes to land tax brackets and foreign investment review board guidelines impact high-value acquisitions. Consulting with experienced property conveyancers and wealth advisors ensures structured asset protection and tax-optimized purchasing.',
    category: 'Legal & Tax',
    author: 'Aura Advisory Legal Counsel',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min read'
  },
  {
    title: 'Suburb Spotlight: Point Piper & Barangaroo Market Dynamics',
    slug: 'suburb-spotlight-point-piper-barangaroo-market-dynamics',
    excerpt: 'Why Sydney Harbour precincts are setting record-breaking median price benchmarks in 2026.',
    content: 'Harbourside precincts like Point Piper and Barangaroo continue to break national price records. Driven by limited supply, private deep-water berths, and unhindered Opera House views, buyer demand remains exceptionally competitive. Exclusive off-market transactions account for over 40% of luxury transactions in these premier postcodes.',
    category: 'Luxury Suburbs',
    author: 'Prestige Realty Analysts',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read'
  }
];

module.exports = {
  sampleUsers,
  sampleAgencies,
  sampleProperties,
  sampleBlogs
};
