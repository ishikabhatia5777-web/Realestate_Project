const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { sampleProperties } = require('./seedData');
// ─── Format property list into a readable context string for AI ───────────
const buildPropertyContext = (properties) => {
  if (!properties || properties.length === 0) {
    return 'No properties currently in the database.';
  }

  return properties.map((p, i) => {
    const price = p.listing === 'Sale'
      ? `AUD $${p.price?.toLocaleString()}`
      : `AUD $${p.price?.toLocaleString()}/${p.pricePeriod || 'week'}`;

    return [
      `[${i + 1}] ${p.title} (Property ID: ${p._id})`,
      `  Page URL: /properties/${p._id}`,
      `  Type: ${p.type} | Listing: ${p.listing} | Price: ${price} | Tier: ${p.tier}`,
      `  Location: ${p.street}, ${p.suburb}, ${p.state}`,
      `  Beds: ${p.beds} | Baths: ${p.baths} | Parking: ${p.parking} | Area: ${p.area}m²`,
      p.amenities?.length ? `  Amenities: ${p.amenities.join(', ')}` : '',
      p.features?.length ? `  Features: ${p.features.join(', ')}` : '',
      p.description ? `  Description: ${p.description}` : ''
    ].filter(Boolean).join('\n');
  }).join('\n\n');
};

// ─── Aura AI Chatbot powered by Groq (LLaMA 3.3 70B), OpenAI & Gemini with live database context ───────
const processAIChat = async (userQuery, propertyContext = []) => {
  const q = (userQuery || '').toLowerCase().trim();
  const isOutOfScope = 
    q.includes('python') || q.includes('javascript') || q.includes('merge two sorted') ||
    q.includes('script') || q.includes('recipe') || q.includes('coding') || 
    q.includes('weather') || q.includes('movie') || q.includes('sport') ||
    q.includes('trivia') || q.includes('write a');

  if (isOutOfScope) {
    return "I am Aura AI, the official concierge for AuraEstates. I specialize exclusively in helping you browse properties, connect with agents, and buy luxury real estate on our platform. How can I assist you with AuraEstates properties today?";
  }

  const groqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const propertyData = buildPropertyContext(propertyContext);
  const totalCount = propertyContext.length;

  const systemPrompt = `You are "Aura AI", the official intelligent real estate concierge for AuraEstates (Australia's premier luxury real estate marketplace).

LIVE DATABASE ACCESS (${totalCount} published properties):
═══════════════════════════════════════
${propertyData}
═══════════════════════════════════════

VERIFIED PLATFORM AGENTS & AGENCIES:
1. Samantha Reed — Senior Agent at Prestige Realty | Specialty: Point Piper Waterfront Luxury | Phone: +61 444 111 222 | Email: samantha@prestigerealty.com.au
2. Julian Thorne — Agency Director at Prestige Realty | Specialty: Sydney CBD & Barangaroo Penthouses | Phone: +61 444 333 444 | Email: agency@prestigerealty.com.au
3. Marcus Sterling — FSBO Property Seller | Specialty: Direct Owner Listings | Phone: +61 444 888 999 | Email: seller@gmail.com

STRICT PLATFORM BOUNDARY (CRITICAL RULE):
- You MUST answer ONLY questions related to AuraEstates website, buying properties, searching listings, making offers, booking inspections, contacting agents/sellers, platform subscriptions, mortgage calculations, and real estate market advice.
- If the user inputs a suburb name, city, location, or keyword (e.g. "point piper", "barangaroo", "bondi", "sydney", "melbourne", "villa", "cheap house"), ALWAYS TREAT IT AS A PROPERTY SEARCH QUERY! Match all properties in that suburb or area from the LIVE DATABASE ACCESS list, and respond with a formatted list/table of matching properties with prices, bedrooms, suburb, and exact clickable links [View Property](/properties/ID).
- If the user asks about out-of-scope topics completely unrelated to real estate or AuraEstates (e.g. coding, recipe, weather outside Australia, general trivia, movies, sports, other websites), politely decline with:
  "I am Aura AI, the official concierge for AuraEstates. I specialize exclusively in helping you browse properties, connect with agents, and buy luxury real estate on our platform. How can I assist you with AuraEstates properties today?"

HOW TO BUY A PROPERTY ON AURAESTATES:
When users ask how to buy a property or reserve a listing, provide these 4 steps:
1. Browse Listings: Explore our published properties on the [Explore All Properties](/properties) page.
2. Book Inspection: Open any property page and click "Book Inspection" to schedule a private walkthrough.
3. Submit an Offer: Click "Make an Offer" on the property page to send your proposed price directly to the Agent/Seller dashboard.
4. Holding Deposit & Purchase: Click **"Buy Property (Reserve Now)"** on the listing page to pay the holding deposit securely via Stripe or UPI Scan QR Code!

FORMATTING & TABLE DIRECTIVES:
- When asked for a list of Agents, Agencies, or Property Comparisons, ALWAYS format the data using clean Markdown Tables!
- When recommending properties, include property title, location, specs, price, AND its exact clickable page link using the exact 24-character Property ID from the LIVE DATABASE ACCESS section (e.g. [View Property](/properties/507f1f77bcf86cd799439000)).
- NEVER use generic placeholders like EXACT_ID or PROPERTY_ID!

Example Agent Table:
| Agent Name | Agency | Specialty Precinct | Phone Contact | Email |
| :--- | :--- | :--- | :--- | :--- |
| Samantha Reed | Prestige Realty | Point Piper & Sydney Harbour | +61 444 111 222 | samantha@prestigerealty.com.au |
| Julian Thorne | Prestige Realty | Barangaroo & Sydney CBD | +61 444 333 444 | agency@prestigerealty.com.au |
| Marcus Sterling | FSBO Direct | Direct Owner Properties | +61 444 888 999 | seller@gmail.com |

Example Property Table:
| Property Title | Type | Suburb | Specs | Price | Page Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| The Grand Waterfront Villa at Point Piper | Villa | Point Piper | 6 Beds | AUD $18,500,000 | [View Property](/properties/507f1f77bcf86cd799439000) |
| Point Piper Oceanfront Estate & Private Jetty | Villa | Point Piper | 7 Beds | AUD $24,000,000 | [View Property](/properties/507f1f77bcf86cd799439001) |`;

  // 1. Try Groq AI Cloud API (LLaMA 3.3 70B / 8B Instant) if Groq key present
  if (groqKey && (groqKey.startsWith('gsk_') || groqKey.startsWith('sk-'))) {
    try {
      const isGroq = groqKey.startsWith('gsk_');
      const endpoint = isGroq
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      
      const primaryModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: primaryModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.7,
          max_tokens: 650
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else if (data.error && isGroq) {
        console.warn('Groq Primary Model Error, switching to fallback llama-3.1-8b-instant:', data.error.message || data.error.code);
        const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userQuery }
            ],
            temperature: 0.7,
            max_tokens: 650
          })
        });
        const fbData = await fallbackRes.json();
        if (fbData.choices && fbData.choices[0] && fbData.choices[0].message) {
          return fbData.choices[0].message.content;
        }
      }
    } catch (groqErr) {
      console.error('Groq AI API request error:', groqErr.message);
    }
  }

  // 2. Try Gemini API fallback if Gemini Key present
  if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const fullPrompt = `${systemPrompt}\n\nUser question: ${userQuery}`;
      const result = await model.generateContent(fullPrompt);
      return result.response.text();
    } catch (geminiErr) {
      console.error('Gemini API error:', geminiErr.message);
    }
  }

  // 3. Fallback smart concierge engine if offline or API error
  return fallbackKeywordChat(userQuery, propertyContext);
};

// ─── Smart concierge fallback when API key quota is exceeded or offline ─────────
const fallbackKeywordChat = (userQuery, properties = []) => {
  const q = (userQuery || '').toLowerCase().trim();

  // How to buy / process intent
  if (q.includes('how to buy') || q.includes('how do i buy') || q.includes('how can i buy') || q.includes('kese buy') || q.includes('buying process') || q.includes('purchase') || q.includes('reserve')) {
    return `Here are the 4 simple steps to buy a property on AuraEstates:

1. **Browse Listings**: Go to the [Explore All Properties](/properties) page and filter by suburb or price.
2. **Book Inspection**: Open any listing and click **"Book Inspection"** to schedule a private viewing.
3. **Submit an Offer**: Click **"Make an Offer"** on the property page to submit your proposed buying price and deposit to the Agent/Seller.
4. **Holding Deposit & Purchase**: Click **"Buy Property (Reserve Now)"** on the property page to pay the holding deposit securely via Stripe or UPI Scan QR Code!`;
  }

  // Direct suburb / city / location / title keyword match
  const matchedSuburbProps = properties.filter(p => {
    if (!q) return false;
    const sub = (p.suburb || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const street = (p.street || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    // Only match if the property field actually has a value to prevent "" matching everything
    return (sub && q.includes(sub)) || (city && q.includes(city)) || (street && q.includes(street)) || (title && q.includes(title));
  });

  if (matchedSuburbProps.length > 0) {
    const { sampleProperties } = require('./seedData');
    const tableRows = matchedSuburbProps.slice(0, 6).map((p, index) => {
      const price = p.listing === 'Sale'
        ? `AUD $${p.price?.toLocaleString()}`
        : `AUD $${p.price?.toLocaleString()}/${p.pricePeriod || 'week'}`;
      
      let propId = p.id || p._id;
      if (!propId || propId === '507f1f77bcf86cd799439000') {
        const foundIdx = sampleProperties.findIndex(sp => sp.title === p.title);
        const resolvedIdx = foundIdx !== -1 ? foundIdx : index;
        propId = `507f1f77bcf86cd799439${String(resolvedIdx).padStart(3, '0')}`;
      }

      return `| [**${p.title}**](/properties/${propId}) | ${p.type || 'Residential'} | ${p.suburb || 'Sydney'} | ${p.beds || 0} Beds | ${price} | [View Property](/properties/${propId}) |`;
    }).join('\n');

    return `Here are active property listings in **"${userQuery.trim()}"** from our live database:

| Property Title | Type | Suburb | Specs | Price | Page Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
${tableRows}

*Click **"View Property"** or any property title above to view full details!*`;
  }

  // Greetings
  if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey') || q.includes('who are you') || q.includes('how are you')) {
    return "Hello! I'm Aura AI, the official intelligent concierge for AuraEstates. I can help you search for properties, find agents, or guide you through the buying process. What can I do for you today?";
  }

  // Agent / Agency query intent (Moved UP to prevent being caught by 'list' in property search)
  if (q.includes('agent') || q.includes('agency') || q.includes('realty') || q.includes('broker') || q.includes('contact')) {
    return `Here is our list of verified platform Agents & Agencies on AuraEstates:

| Agent Name | Agency | Specialty Precinct | Phone Contact | Email |
| :--- | :--- | :--- | :--- | :--- |
| Samantha Reed | Prestige Realty | Point Piper & Sydney Harbour | +61 444 111 222 | samantha@prestigerealty.com.au |
| Julian Thorne | Prestige Realty | Barangaroo & Sydney CBD | +61 444 333 444 | agency@prestigerealty.com.au |
| Marcus Sterling | FSBO Direct | Direct Owner Properties | +61 444 888 999 | seller@gmail.com |

You can contact any agent directly via phone, email, or by scheduling an inspection on the property listing page!`;
  }

  // Extract property types
  let pType = null;
  if (q.includes('villa')) pType = 'Villa';
  else if (q.includes('apartment')) pType = 'Apartment';
  else if (q.includes('house') || q.includes('home') || q.includes('residential')) pType = 'Residential';
  else if (q.includes('farm')) pType = 'Farm';
  else if (q.includes('townhouse')) pType = 'Townhouse';
  else if (q.includes('commercial') || q.includes('office') || q.includes('warehouse')) pType = 'Commercial';

  // Check intent words
  const isSearchIntent = q.includes('want') || q.includes('need') || q.includes('looking') || 
                         q.includes('show') || q.includes('find') || q.includes('list') || 
                         q.includes('search') || q.includes('buy') || q.includes('rent') || q.includes('property') || q.includes('properties');

  // Specific non-existent location requested (e.g. Antarctica, Paris, New York, Tokyo)
  const isUnmatchedLocation = q.includes('antarctica') || q.includes('paris') || q.includes('tokyo') || 
                               q.includes('london') || q.includes('new york') || q.includes('dubai');

  if (isUnmatchedLocation) {
    const availableLocations = Array.from(new Set(properties.map(p => p.suburb).filter(Boolean))).join(', ');
    return `AuraEstates currently operates exclusively in prime Australian markets! We don't have listings in that region, but we have extraordinary ${pType || 'luxury'} listings in ${availableLocations || 'Point Piper, Barangaroo, and Sydney'}. Would you like to explore those?`;
  }

  // Property search matching
  if (isSearchIntent || pType) {
    let filtered = [...properties];

    if (pType) filtered = filtered.filter(p => p.type === pType);

    if (q.includes('rent')) filtered = filtered.filter(p => p.listing === 'Rent');
    else if (q.includes('sale') || q.includes('buy')) filtered = filtered.filter(p => p.listing === 'Sale');

    if (filtered.length === 0) {
      return `I couldn't find ${pType ? pType.toLowerCase() + ' ' : ''}listings matching that exact request. We currently have ${properties.length} active listings available on AuraEstates. Try browsing our Properties page with custom filters!`;
    }

    const list = filtered.slice(0, 4).map((p, i) => {
      const price = p.listing === 'Sale'
        ? `AUD $${p.price?.toLocaleString()}`
        : `AUD $${p.price?.toLocaleString()}/${p.pricePeriod || 'week'}`;
      return `${i + 1}. [**${p.title}**](/properties/${p._id || p.id}) — ${p.suburb || 'Sydney'}, ${p.state || 'NSW'} | ${p.beds} bed, ${p.baths} bath | ${price} → [View Property](/properties/${p._id || p.id})`;
    }).join('\n\n');

    return `Here are top matching ${pType ? pType.toLowerCase() + ' ' : ''}listings from our live database:\n\n${list}\n\nClick any property title above to view full details!`;
  }

  // Cheapest / most expensive
  if (q.includes('cheap') || q.includes('affordable') || q.includes('lowest price')) {
    const sorted = [...properties].filter(p => p.listing === 'Sale').sort((a, b) => a.price - b.price);
    if (sorted.length > 0) {
      const p = sorted[0];
      return `The most affordable property for sale is [**"${p.title}"**](/properties/${p._id || p.id}) in ${p.suburb || 'Sydney'} at AUD $${p.price?.toLocaleString()} — ${p.beds} bed, ${p.baths} bath. [View Property Details](/properties/${p._id || p.id})`;
    }
  }

  if (q.includes('expensive') || q.includes('luxury') || q.includes('premium') || q.includes('highest')) {
    const sorted = [...properties].filter(p => p.listing === 'Sale').sort((a, b) => b.price - a.price);
    if (sorted.length > 0) {
      const p = sorted[0];
      return `Our most premium property is [**"${p.title}"**](/properties/${p._id || p.id}) in ${p.suburb || 'Sydney'} at AUD $${p.price?.toLocaleString()} — ${p.beds} bed, ${p.baths} bath. [View Property Details](/properties/${p._id || p.id})`;
    }
  }

  // Count
  if (q.includes('how many') || q.includes('total') || q.includes('available')) {
    return `AuraEstates currently has **${properties.length}** published properties — including ${properties.filter(p => p.listing === 'Sale').length} for sale and ${properties.filter(p => p.listing === 'Rent').length} for rent. Use the filters on the Properties page to explore them!`;
  }



  // Count
  if (q.includes('how many') || q.includes('total') || q.includes('available')) {
    return `AuraEstates currently has **${properties.length}** published properties — including ${properties.filter(p => p.listing === 'Sale').length} for sale and ${properties.filter(p => p.listing === 'Rent').length} for rent. Use the filters on the Properties page to explore them!`;
  }

  // Mortgage
  if (q.includes('mortgage') || q.includes('repayment') || q.includes('loan')) {
    return "At Australian interest rates (~6.1%), an $800,000 mortgage over 30 years costs approx $3,880/month. Use our EMI calculator on any listing page for custom estimates!";
  }

  // Out of scope default response
  return `I am Aura AI, the official concierge for AuraEstates! I specialize exclusively in helping you browse properties, connect with agents, and buy luxury real estate on our platform. 

Try asking me:
- *"Show me all properties for sale"*
- *"List all agents"*
- *"How to buy a property?"*`;
};

// ─── AI Property Description Generator ───────────────────────────────────────
const generateAIDescription = async ({ title, propertyType, listingType, bedrooms, bathrooms, suburb, city, amenities = [] }) => {
  const groqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

  if (groqKey && (groqKey.startsWith('gsk_') || groqKey.startsWith('sk-'))) {
    try {
      const isGroq = groqKey.startsWith('gsk_');
      const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
      const primaryModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

      const prompt = `Write an attractive, elegant, 3-paragraph luxury real estate property listing description for:
Property Title: ${title}
Category: ${propertyType}
Listing Purpose: For ${listingType}
Location: ${suburb}, ${city || 'Australia'}
Specs: ${bedrooms} Bedrooms, ${bathrooms} Bathrooms
Key Amenities: ${amenities.join(', ') || 'Modern finishes, open-plan living, prime location'}

Focus on high-end architectural appeal, natural lighting, premium lifestyle amenities, and prime location convenience. Do not include markdown code block formatting like \`\`\`.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: primaryModel,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.error('Groq AI Description error:', err.message);
    }
  }
  const amenityText = amenities.length > 0 ? ` featuring premium amenities like ${amenities.slice(0, 4).join(', ')}` : '';
  const intros = [
    `Welcome to an extraordinary opportunity in the heart of ${suburb || city || 'the city'}.`,
    `Immaculately presented and architecturally designed, this luxurious ${bedrooms || 3}-bedroom ${(propertyType || 'property').toLowerCase()} sets a new benchmark for modern living in ${suburb || city}.`,
    `Positioned in one of ${suburb || city}'s most sought-after pockets, this pristine ${listingType === 'Rent' ? 'rental sanctuary' : 'residence'} delivers an unparalleled lifestyle.`
  ];
  const highlights = `Boasting ${bedrooms || 3} spacious bedrooms, ${bathrooms || 2} contemporary bathrooms, and expansive open-plan living areas saturated with natural light${amenityText}.`;
  const outro = `Ideally located within minutes of premier schools, vibrant dining precincts, and public transport hubs. Contact our team today to arrange a private inspection.`;
  return `${intros[Math.floor(Math.random() * intros.length)]}\n\n${highlights}\n\n${outro}`;
};

// ─── AI Valuation Model ───────────────────────────────────────────────────────
const calculateAIValuation = ({ propertyType, bedrooms, bathrooms, landArea, suburb, price }) => {
  const basePrice = price || 850000;
  const bedValue = (bedrooms || 3) * 125000;
  const estimatedMin = Math.round((basePrice * 0.94 + bedValue * 0.1) / 1000) * 1000;
  const estimatedMax = Math.round((basePrice * 1.08 + bedValue * 0.15) / 1000) * 1000;
  return {
    estimatedMin,
    estimatedMax,
    medianEstimate: Math.round((estimatedMin + estimatedMax) / 2),
    confidenceScore: Math.floor(Math.random() * 8) + 91,
    pricePerSqM: Math.round(basePrice / (landArea || 400)),
    rentalYieldEst: ((basePrice * 0.042) / 52).toFixed(0) + ' / week',
    suburbGrowthYoY: '+7.4%'
  };
};

// ─── Fraud Detection ──────────────────────────────────────────────────────────
const analyzeListingFraud = ({ price, propertyType, description, images = [] }) => {
  let riskScore = 4;
  const reasons = [];
  if (price && price < 100000 && propertyType !== 'Land') { riskScore += 45; reasons.push('Price significantly below suburb benchmark.'); }
  if (images.length === 0) { riskScore += 25; reasons.push('No images uploaded.'); }
  if (description && description.length < 50) { riskScore += 15; reasons.push('Description is abnormally brief.'); }
  return {
    riskScore: Math.min(100, riskScore),
    status: riskScore > 50 ? 'Flagged for Admin Review' : 'Low Fraud Risk (Passed)',
    reasons: reasons.length > 0 ? reasons : ['All safety checks passed.']
  };
};

// ─── 24/7 Supporting Agent Chat Auto-Responder powered by Aura AI Pipeline ────
const generateSupportAgentReply = async ({ buyerMessage, buyerName = 'Buyer', agent = {}, property = {}, allProperties = [] }) => {
  let agentName = agent?.name || 'Samantha Reed';
  if (agentName === 'User') agentName = 'your AI Agent';

  const agentRole = agent?.role === 'seller' || agent?.role === 'owner' ? 'Property Owner' : 'Senior Real Estate Specialist';
  const agentPhone = agent?.phone || '+61 444 111 222';
  const agentEmail = agent?.email || 'samantha@prestigerealty.com.au';
  const agencyName = agent?.agencyName || 'Prestige Realty';

  const propTitle = property?.title || 'this executive property';
  const propPrice = property?.price ? `AUD $${Number(property.price).toLocaleString()}` : 'Price on Request';
  const propListing = property?.listingType || property?.listing || 'Sale';
  const propPeriod = property?.pricePeriod ? `/${property.pricePeriod}` : (propListing === 'Rent' ? '/week' : '');
  const propSuburb = property?.address?.suburb || property?.suburb || 'Sydney';
  const propCity = property?.address?.city || property?.city || 'Sydney';
  const propState = property?.address?.state || property?.state || 'NSW';
  const propBeds = property?.bedrooms || property?.beds || '3';
  const propBaths = property?.bathrooms || property?.baths || '2';
  const propType = property?.propertyType || property?.type || 'Penthouse';
  const propDesc = property?.description ? property.description.substring(0, 300) : '';

  const propAmenities = Array.isArray(property?.amenities) && property.amenities.length > 0
    ? property.amenities.join(', ')
    : 'Harbour Views, Concierge Service, Private Terrace, Gym & Spa, Secure Parking';
  
  const propFeatures = Array.isArray(property?.features) && property.features.length > 0
    ? property.features.join(', ')
    : 'High Floor View, Open Plan Living, Designer Kitchen, High Ceilings';

  // Format recommendations for other properties
  const currentPropId = String(property?._id || property?.id || '');
  const otherProps = (allProperties && allProperties.length > 0 ? allProperties : sampleProperties)
    .filter(p => String(p._id || p.id) !== currentPropId)
    .slice(0, 3);

  const recommendationText = otherProps.map((p, i) => {
    const pPrice = p.listingType === 'Sale' || p.listing === 'Sale'
      ? `AUD $${Number(p.price || 5000000).toLocaleString()}`
      : `AUD $${Number(p.price || 1500).toLocaleString()}/week`;
    const pId = p._id || p.id || `507f1f77bcf86cd79943900${i}`;
    const pSub = p.address?.suburb || p.suburb || 'Point Piper';
    return `${i + 1}. [**${p.title}**](/properties/${pId}) — ${pSub} (${p.bedrooms || p.beds || 3} Beds | ${pPrice})`;
  }).join('\n');


  const groqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `You are real estate specialist ${agentName} (${agentRole} at ${agencyName}) on AuraEstates.
The buyer ${buyerName} is currently viewing and asking about THIS SPECIFIC PROPERTY:
- Title: ${propTitle}
- Location: ${propSuburb}, ${propCity}, ${propState}
- Category: ${propType} (${propListing})
- Price: ${propPrice}${propPeriod}
- Specifications: ${propBeds} Bedrooms, ${propBaths} Bathrooms
- Key Amenities: ${propAmenities}
- Highlights & Features: ${propFeatures}
- Description: ${propDesc || 'Exclusive luxury residence with premium finishes.'}
- Contact Details: Phone: ${agentPhone} | Email: ${agentEmail}

OTHER RECOMMENDED PROPERTIES ON PLATFORM:
${recommendationText}

CRITICAL FORMATTING & STRUCTURE RULES:
1. Speak directly as ${agentName}.
2. Keep your answer highly concise, direct, and straight-to-the-point with zero extra fluff.
3. ALWAYS format your responses cleanly using bullet points (•), bold key headers (e.g. **📍 Location:**, **💰 Price:**, **🛏️ Specs:**, **✨ Highlights:**, **📞 Contact:**), and short readable paragraphs.
4. If asked for "details", "features", "specs", or "amenities" -> Provide a neatly structured, concise bullet-point summary of THIS SELECTED PROPERTY (${propTitle}).
5. If asked to "recommend another property" or "show other options" -> Provide a structured numbered list of the alternative properties above with clickable page links!
6. Ensure all information is covered but in as few words/sentences as possible.`;

  const userPrompt = `Buyer ${buyerName} asked: "${buyerMessage}"`;

  // 1. Try Groq AI Cloud API (LLaMA 3.3 70B / 8B)
  if (groqKey && (groqKey.startsWith('gsk_') || groqKey.startsWith('sk-'))) {
    try {
      const isGroq = groqKey.startsWith('gsk_');
      const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
      const primaryModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: primaryModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 320
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      } else if (data.error && isGroq) {
        const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 320
          })
        });
        const fbData = await fallbackRes.json();
        if (fbData.choices && fbData.choices[0] && fbData.choices[0].message) {
          return fbData.choices[0].message.content.trim();
        }
      }
    } catch (groqErr) {
      console.error('Groq API error in Agent chat:', groqErr.message);
    }
  }

  // 2. Try Gemini API (gemini-2.0-flash)
  if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(fullPrompt);
      if (result && result.response) {
        return result.response.text().trim();
      }
    } catch (geminiErr) {
      console.error('Gemini API error in Agent chat:', geminiErr.message);
    }
  }

  // 3. Fallback Structured Supporting Agent Engine
  const q = (buyerMessage || '').toLowerCase().trim();

  // Recommendations
  if (q.includes('recommend') || q.includes('other') || q.includes('suggest') || q.includes('similar') || q.includes('another') || q.includes('different') || q.includes('options')) {
    return `Here are top recommended luxury properties on AuraEstates:\n\n${recommendationText}\n\n*Click any property link above to view full details!*`;
  }

  // Details / Features / Amenities
  if (q.includes('detail') || q.includes('feature') || q.includes('amenit') || q.includes('facility') || q.includes('spec') || q.includes('about')) {
    return `Here are the key details for **${propTitle}**:\n\n• **📍 Location**: ${propSuburb}, ${propCity}, ${propState}\n• **💰 Price**: ${propPrice}${propPeriod} (${propListing})\n• **🛏️ Specs**: ${propBeds} Bedrooms | ${propBaths} Bathrooms (${propType})\n• **✨ Highlights**: ${propFeatures}\n• **🛋️ Amenities**: ${propAmenities}\n\nWould you like to schedule a private walkthrough tour?`;
  }

  if (q === 'hi' || q === 'hii' || q === 'hello' || q === 'hey' || q.includes('kaise') || q.includes('greetings')) {
    const titleLower = propTitle.toLowerCase();
    const subLower = propSuburb.toLowerCase();
    const locationStr = titleLower.includes(subLower) ? '' : ` in ${propSuburb}`;
    const agentStr = agentName === 'your AI Agent' ? agentName : `**${agentName}**`;
    return `Hello ${buyerName}! 👋 I'm ${agentStr}.\n\nHow can I assist you with **${propTitle}**${locationStr} today?`;
  }

  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('kitna') || q.includes('amount') || q.includes('budget') || q.includes('worth')) {
    return `**Price Details for ${propTitle}**:\n\n• **Asking Price**: **${propPrice}${propPeriod}**\n• **Listing Purpose**: For ${propListing}\n• **Location**: ${propSuburb}, ${propCity}\n\nWould you like to submit an offer or schedule a private viewing?`;
  }

  if (q.includes('inspection') || q.includes('visit') || q.includes('viewing') || q.includes('walkthrough') || q.includes('see') || q.includes('timing') || q.includes('available')) {
    return `**Private Walkthrough Inspection for ${propTitle}**:\n\n• **Available Days**: Tomorrow & This Weekend\n• **Time Slots**: Flexible Morning & Afternoon\n\nWhat date and time works best for your schedule?`;
  }

  if (q.includes('phone') || q.includes('number') || q.includes('email')) {
    return `**Direct Contact Details for ${agentName}**:\n\n• 📞 **Phone**: ${agentPhone}\n• ✉️ **Email**: ${agentEmail}\n• 🏢 **Agency**: ${agencyName}\n\nWould you like me to request a direct callback for you?`;
  }

  if (q.includes('location') || q.includes('where') || q.includes('suburb') || q.includes('address')) {
    return `**Location & Property Specs for ${propTitle}**:\n\n• **Address**: ${propSuburb}, ${propCity}, ${propState}\n• **Category**: ${propType}\n• **Specifications**: ${propBeds} Beds | ${propBaths} Baths\n\nWould you like a private walkthrough?`;
  }

  if (q.includes('buy') || q.includes('offer') || q.includes('purchase') || q.includes('reserve') || q.includes('deposit') || q.includes('deal')) {
    return `**How to Reserve & Buy ${propTitle}**:\n\n1. Click **"Make an Offer"** on the listing page to submit your price.\n2. Or click **"Buy Property (Reserve Now)"** to pay the holding deposit securely.\n\nLet me know if you need assistance with payment options!`;
  }

  return `Thank you for reaching out regarding **${propTitle}**!\n\n• **📍 Suburb**: ${propSuburb}, ${propCity}\n• **💰 Price**: ${propPrice}${propPeriod}\n• **🛏️ Specs**: ${propBeds} Beds | ${propBaths} Baths\n\nHow can I assist you with this property today?`;
};
// ─── Property Appraisal Generator ─────────────────────────────────────────────
const generatePropertyAppraisal = async (subjectProperty, candidates) => {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error('Groq configuration missing. Appraisal generation failed.');
  }

  // Determine category reference
  const pType = subjectProperty.propertyType || '';
  let refFileName = 'residential.md';
  if (['Residential', 'Villa', 'Apartment', 'Townhouse'].includes(pType)) refFileName = 'residential.md';
  else if (pType === 'Farm') refFileName = 'farm.md';
  else if (pType === 'Land') refFileName = 'land.md';
  else if (['Commercial', 'Office', 'Warehouse'].includes(pType)) refFileName = 'office.md';

  // Load files
  const skillDir = path.join(__dirname, '../../../.agents/skills/property-appraisal');
  const skillPath = path.join(skillDir, 'SKILL.md');
  const refPath = path.join(skillDir, 'references', refFileName);
  const dataModeRefPath = path.join(skillDir, 'references', 'aura-estate-data-mode.md');

  let skillContent = '';
  let refContent = '';
  let dataModeContent = '';
  try {
    skillContent = fs.readFileSync(skillPath, 'utf8');
    refContent = fs.readFileSync(refPath, 'utf8');
    dataModeContent = fs.readFileSync(dataModeRefPath, 'utf8');
  } catch (err) {
    throw new Error('Failed to load appraisal methodology files.');
  }

  // Clean & condense prompt contents to stay well within Groq TPM limits (under ~2500 system tokens)
  const cleanDoc = (txt) => {
    return txt
      .replace(/```[\s\S]*?```/g, '') // remove large ascii diagrams & code blocks
      .replace(/^[ \t]*#+ /gm, '## ') // normalize headers
      .replace(/\n{3,}/g, '\n\n')    // condense multiple newlines
      .trim();
  };

  const conciseSkill = cleanDoc(skillContent).slice(0, 2000);
  const conciseDataMode = cleanDoc(dataModeContent).slice(0, 2000);
  const conciseRef = cleanDoc(refContent).slice(0, 1000);

  const systemPrompt = `You are an expert real estate appraiser executing the Aura Estate Property Appraisal Skill.

### SKILL RULES & METHODOLOGY:
${conciseSkill}

### DATABASE-FIRST RULES:
${conciseDataMode}

### CATEGORY SPECIFICS:
${conciseRef}

CRITICAL DIRECTIVES:
- mode: aura_estate_database
- allow_external_market_research: false
- Use ONLY the provided database records. Do NOT invent or hallucinate any figures/records.
- Strictly distinguish between asking_price, listing_price, and sale_price. (For active listings, listing_price/asking_price equals the price field, and sale_price MUST be null).
- Use null for missing/unavailable numeric values. Never invent missing database information.
- DO NOT output reasoning, thinking process, or <think> tags. Start immediately with the character '{' and output strictly a single valid JSON object.

JSON SCHEMA TO FOLLOW:

{
  "report": {
    "title": "Property Appraisal Report",
    "generated_at": "${new Date().toISOString()}",
    "executive_summary": {
      "estimated_value_range": { "low": 0, "high": 0, "currency": "AUD" },
      "most_likely_value": 0,
      "confidence": "High | Medium | Low",
      "summary": "..."
    },
    "subject_property": {
      "id": "...",
      "property_type": "...",
      "location": "...",
      "listing_type": "...",
      "asking_price": 0,
      "sale_price": null,
      "bedrooms": 0,
      "bathrooms": 0,
      "parking_spaces": 0,
      "building_area": 0,
      "land_area": 0,
      "year_built": 0,
      "condition": "...",
      "status": "...",
      "key_features": []
    },
    "valuation_approach": {
      "method": "Direct Comparison Method",
      "reason": "...",
      "category_methodology": "..."
    },
    "market_evidence": {
      "candidate_count": ${candidates.length},
      "selected_comparable_count": 0,
      "data_source": "Aura Estate Database",
      "external_research_used": false
    },
    "comparables": [
      {
        "id": "...",
        "location": "...",
        "property_type": "...",
        "listing_price": 0,
        "asking_price": 0,
        "sale_price": null,
        "bedrooms": 0,
        "bathrooms": 0,
        "building_area": 0,
        "land_area": 0,
        "similarity": "High | Medium | Low"
      }
    ],
    "comparable_analysis": [
      {
        "id": "...",
        "similarity": "High | Medium | Low",
        "why_selected": "...",
        "similarities": [],
        "differences": [],
        "effect_on_valuation": "..."
      }
    ],
    "adjustments": [
      {
        "factor": "...",
        "comparable_id": "...",
        "direction": "positive | negative | neutral",
        "adjustment_amount": 0,
        "reason": "..."
      }
    ],
    "valuation_reconciliation": {
      "method": "Weighted Average",
      "weighting": "...",
      "adjusted_indications": [],
      "reconciliation_reasoning": "..."
    },
    "final_valuation": {
      "low": 0,
      "high": 0,
      "most_likely": 0,
      "currency": "AUD",
      "reasoning": "..."
    },
    "key_value_drivers": {
      "positive_factors": [],
      "negative_factors": []
    },
    "risks_and_limitations": [],
    "confidence_assessment": {
      "level": "High | Medium | Low",
      "explanation": "..."
    },
    "data_sources_and_assumptions": {
      "primary_source": "Aura Estate Database",
      "external_sources_used": false,
      "candidate_count": ${candidates.length},
      "comparable_count": 0,
      "assumptions": [],
      "missing_information": []
    },
    "disclaimer": "This property appraisal estimate is generated automatically using Aura Estate database evidence."
  }
}
`;

  const mapPropToContext = (p) => {
    const minP = {
      id: String(p._id),
      cat: p.propertyType,
      listType: p.listingType,
      price: p.price,
      loc: `${p.address?.street ? p.address.street + ', ' : ''}${p.address?.suburb}, ${p.address?.state}`,
      beds: p.bedrooms,
      baths: p.bathrooms,
      parking: p.parkingSpaces,
      landArea: p.landArea,
      floorArea: p.floorArea,
      yearBuilt: p.yearBuilt,
      status: p.status
    };
    if (p.features && p.features.length) minP.feat = p.features.slice(0, 3);
    return minP;
  };

  const subjectContext = mapPropToContext(subjectProperty);
  const candidatesContext = candidates.map(mapPropToContext);

  const userPrompt = `Generate a structured JSON property appraisal report for the subject property using the supplied comparables.

SUBJECT PROPERTY:
${JSON.stringify(subjectContext, null, 2)}

CANDIDATE COMPARABLES (Aura Estate Database):
${JSON.stringify(candidatesContext, null, 2)}
`;

  try {
    const isGroq = groqKey.startsWith('gsk_');
    const endpoint = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    
    let model = isGroq ? 'openai/gpt-oss-20b' : 'gpt-4o-mini';

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4500
      })
    });

    let data = await response.json();

    if (data.error && isGroq && (data.error.code === 'rate_limit_exceeded' || data.error.type === 'tokens')) {
       console.warn("Primary model hit rate limit, falling back to qwen/qwen3.6-27b...");
       model = 'qwen/qwen3.6-27b';
       response = await fetch(endpoint, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${groqKey}`
         },
         body: JSON.stringify({
           model,
           messages: [
             { role: 'system', content: systemPrompt },
             { role: 'user', content: userPrompt }
           ],
           temperature: 0.1,
           max_tokens: 4500
         })
       });
       data = await response.json();
    }

    if (data.error) {
       console.error("Groq API Error:", data.error);
       if (data.error.code === 'rate_limit_exceeded') throw new Error('Groq rate limit exceeded. Please wait 1 minute before trying again.');
       if (data.error.message && data.error.message.includes('token')) throw new Error('Groq token limit exceeded');
       throw new Error(`Groq API Error: ${data.error.message || 'Unknown error'}`);
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      let rawContent = data.choices[0].message.content.trim();
      
      // Strip reasoning/think tags if present
      rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      // Find start of JSON '{'
      const firstBraceIndex = rawContent.indexOf('{');
      if (firstBraceIndex !== -1) {
        rawContent = rawContent.substring(firstBraceIndex);
      }

      // Safely strip markdown code fences if present
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawContent];
      const jsonStr = (jsonMatch[1] || rawContent).trim();

      const safeParseJson = (str) => {
        try {
          return JSON.parse(str);
        } catch (e) {
          let cleaned = str.trim();
          const stack = [];
          let inString = false;
          let escaped = false;
          for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];
            if (escaped) { escaped = false; continue; }
            if (char === '\\') { escaped = true; continue; }
            if (char === '"') { inString = !inString; continue; }
            if (!inString) {
              if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
              else if (char === '}' || char === ']') stack.pop();
            }
          }
          if (inString) cleaned += '"';
          while (stack.length > 0) cleaned += stack.pop();
          return JSON.parse(cleaned);
        }
      };

      try {
        const parsed = safeParseJson(jsonStr);
        if (parsed) {
          return parsed.report ? parsed.report : parsed;
        }
        throw new Error("Empty JSON parsed");
      } catch (parseErr) {
        console.error("Failed to parse Groq JSON response:", rawContent);
        throw new Error("Groq returned an invalid JSON response format.");
      }
    }
    
    throw new Error('Malformed AI response from Groq');
  } catch (err) {
    console.error('Appraisal Generation Error:', err);
    throw err;
  }
};

module.exports = { generateAIDescription, calculateAIValuation, analyzeListingFraud, processAIChat, generateSupportAgentReply, generatePropertyAppraisal };





