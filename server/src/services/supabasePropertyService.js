const supabase = require('../config/supabase');

/**
 * Maps a raw Supabase property row to the existing API shape
 * so the frontend does not need any changes.
 */
function mapSupabaseProperty(row) {
  if (!row) return null;

  // Parse price string like "$819,000+" or "$1,150,000" -> number
  let priceNum = row.price_numeric;
  if (!priceNum && row.price) {
    const cleaned = row.price.replace(/[^0-9.]/g, '');
    priceNum = cleaned ? parseFloat(cleaned) : 0;
  }

  // Determine listing type from URL or default to 'Sale'
  let listingType = 'Sale';
  if (row.url) {
    if (row.url.includes('rent') || row.url.includes('lease')) listingType = 'Rent';
  }

  // Determine property type
  let propertyType = row.property_type || '';
  if (!propertyType || propertyType.trim() === '') {
    const urlMatch = row.url && row.url.match(/property-([a-z]+)-/i);
    if (urlMatch) {
      const t = urlMatch[1].toLowerCase();
      if (t === 'house') propertyType = 'Residential';
      else if (t === 'apartment' || t === 'unit') propertyType = 'Apartment';
      else if (t === 'townhouse') propertyType = 'Townhouse';
      else if (t === 'villa') propertyType = 'Villa';
      else if (t === 'land') propertyType = 'Land';
      else if (t === 'commercial' || t === 'office') propertyType = 'Commercial';
      else propertyType = 'Residential';
    } else {
      propertyType = 'Residential';
    }
  }

  // Parse address into components
  const addressParts = (row.address || '').split(',').map(s => s.trim());
  const street = addressParts[0] || row.address || 'Unknown';
  const suburb = row.suburb_name || addressParts[1] || '';
  const statePostcode = addressParts[2] || '';
  const state = row.state_code || statePostcode.replace(/[0-9 ]/g, '').trim() || 'NSW';
  const postcode = statePostcode.replace(/[^0-9]/g, '') || '2000';
  const city = suburb || addressParts[1] || 'Unknown';

  // Build coordinates
  const coordinates = (row.longitude && row.latitude)
    ? [parseFloat(row.longitude), parseFloat(row.latitude)]
    : [151.2093, -33.8688];

  // Unsplash placeholder images seeded by property id
  const imageKeywords = {
    Residential: 'house,exterior,modern',
    Apartment: 'apartment,interior,modern',
    Townhouse: 'townhouse,modern,exterior',
    Villa: 'villa,luxury,exterior',
    Land: 'land,property,suburb',
    Commercial: 'office,commercial,building'
  };
  const keyword = imageKeywords[propertyType] || 'house,exterior';
  const images = [
    `https://loremflickr.com/800/600/${keyword}?lock=${row.id}`,
    `https://loremflickr.com/800/600/${keyword}?lock=${row.id + 100}`,
    `https://loremflickr.com/800/600/interior,living,modern?lock=${row.id + 200}`
  ];

  return {
    _id: String(row.id),
    id: row.id,
    title: `${propertyType} at ${street}`,
    description: row.description || `Beautiful ${propertyType.toLowerCase()} located at ${row.address}.`,
    propertyType,
    listingType,
    price: priceNum || 0,
    priceDisplay: row.price || 'Contact Agent',
    pricePeriod: listingType === 'Rent' ? 'weekly' : 'total',
    address: {
      street,
      suburb,
      city,
      state,
      postcode,
      country: 'Australia'
    },
    location: {
      type: 'Point',
      coordinates
    },
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    parkingSpaces: row.garages || 0,
    landArea: row.land_size ? parseFloat(String(row.land_size).replace(/[^0-9.]/g, '')) || 0 : 0,
    floorArea: row.floor_size ? parseFloat(String(row.floor_size).replace(/[^0-9.]/g, '')) || 0 : 0,
    yearBuilt: 2020,
    energyRating: 5,
    amenities: [],
    features: [],
    images,
    floorPlans: [],
    documents: [],
    virtualTourUrl: '',
    videoUrl: '',
    inspectionDates: row.inspection_dates
      ? (Array.isArray(row.inspection_dates) ? row.inspection_dates : [])
      : [],
    nearbyPoints: { schools: [], hospitals: [], transport: [] },
    status: 'Published',
    tier: 'Standard',
    isBoosted: false,
    viewsCount: Math.floor(Math.random() * 500) + 50,
    savedCount: 0,
    agentId: row.agent_name ? {
      name: row.agent_name,
      email: row.agent_email || '',
      phone: row.agent_phone || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.agent_name)}&background=random`
    } : null,
    agencyId: row.agent_agency ? {
      name: row.agent_agency,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.agent_agency)}&background=random`,
      rating: 4.5,
      reviewCount: 20
    } : null,
    ownerId: null,
    sourceUrl: row.url,
    source: row.source || 'realestate.com.au',
    floodRisk: row.flood_status || null,
    bushfireRisk: row.bushfire_status || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Fetch properties from Supabase with filtering, search, pagination & sorting.
 */
async function getSupabaseProperties(filters) {
  const {
    search,
    suburb,
    city,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    state,
    page = 1,
    limit = 12,
    sortBy
  } = filters || {};

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  // Price filters
  if (minPrice) query = query.gte('price_numeric', Number(minPrice));
  if (maxPrice) query = query.lte('price_numeric', Number(maxPrice));
  if (minPrice || maxPrice) query = query.not('price_numeric', 'is', null);

  // Bedrooms / bathrooms
  if (bedrooms) query = query.gte('bedrooms', Number(bedrooms));
  if (bathrooms) query = query.gte('bathrooms', Number(bathrooms));

  // State filter
  if (state) query = query.ilike('state_code', state);

  // Suburb / city search
  if (suburb) query = query.ilike('address', `%${suburb}%`);
  else if (city) query = query.ilike('address', `%${city}%`);

  // Full text search
  if (search) {
    query = query.or(`address.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Listing type via URL pattern
  if (listingType && listingType.toLowerCase() === 'rent') {
    query = query.or('url.ilike.%rent%,url.ilike.%lease%');
  }

  // Property type via URL pattern
  if (propertyType) {
    const typeMap = {
      Residential: 'house',
      Apartment: 'apartment',
      Townhouse: 'townhouse',
      Villa: 'villa',
      Land: 'land',
      Commercial: 'commercial'
    };
    const urlKeyword = typeMap[propertyType] || propertyType.toLowerCase();
    query = query.ilike('url', `%${urlKeyword}%`);
  }

  // Sorting
  if (sortBy === 'price_asc') {
    query = query.order('price_numeric', { ascending: true, nullsFirst: false });
  } else if (sortBy === 'price_desc') {
    query = query.order('price_numeric', { ascending: false, nullsFirst: false });
  } else if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Supabase query error: ${error.message}`);
  }

  const properties = (data || []).map(mapSupabaseProperty);

  return {
    properties,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limitNum) || 1,
    currentPage: pageNum,
    count: properties.length
  };
}

/**
 * Fetch a single property by its Supabase id.
 */
async function getSupabasePropertyById(id) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapSupabaseProperty(data);
}

/**
 * Fetch similar properties (same state).
 */
async function getSimilarSupabaseProperties(id, limit) {
  const limitNum = limit || 3;
  const source = await getSupabasePropertyById(id);
  if (!source) return [];

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('state_code', source.address.state)
    .neq('id', id)
    .limit(limitNum);

  if (error) return [];
  return (data || []).map(mapSupabaseProperty);
}

module.exports = {
  getSupabaseProperties,
  getSupabasePropertyById,
  getSimilarSupabaseProperties,
  mapSupabaseProperty
};
