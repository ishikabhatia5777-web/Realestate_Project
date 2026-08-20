import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Search, DollarSign, Calendar, Home, ChevronRight, TrendingUp } from 'lucide-react';

// Mock sold properties — realistic Australian luxury market data
const MOCK_SOLD = [
  { id: 's1', title: 'Grand Harbourfront Villa', address: '14 Wolseley Road, Point Piper NSW 2027', soldPrice: 22400000, soldDate: '2026-07-12', bedrooms: 6, bathrooms: 7, parking: 6, landArea: 1200, suburb: 'Point Piper', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600', pricePerSqm: 18667, daysOnMarket: 38 },
  { id: 's2', title: 'Bondi Beachfront Designer Penthouse', address: '120 Campbell Parade, Bondi Beach NSW 2026', soldPrice: 4850000, soldDate: '2026-07-28', bedrooms: 3, bathrooms: 2, parking: 2, landArea: 210, suburb: 'Bondi Beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600', pricePerSqm: 23095, daysOnMarket: 21 },
  { id: 's3', title: 'Toorak European Villa', address: '12 St Georges Road, Toorak VIC 3142', soldPrice: 16500000, soldDate: '2026-06-30', bedrooms: 5, bathrooms: 6, parking: 5, landArea: 1400, suburb: 'Toorak', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600', pricePerSqm: 11786, daysOnMarket: 55 },
  { id: 's4', title: 'Brighton Esplanade Beachside Mansion', address: '64 Esplanade, Brighton VIC 3186', soldPrice: 9400000, soldDate: '2026-07-05', bedrooms: 5, bathrooms: 4, parking: 4, landArea: 980, suburb: 'Brighton', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600', pricePerSqm: 9592, daysOnMarket: 28 },
  { id: 's5', title: 'Mosman Heritage Federation Residence', address: '72 Raglan Street, Mosman NSW 2088', soldPrice: 6900000, soldDate: '2026-08-01', bedrooms: 4, bathrooms: 3, parking: 2, landArea: 750, suburb: 'Mosman', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600', pricePerSqm: 9200, daysOnMarket: 44 },
  { id: 's6', title: 'Noosa Heads Eco Luxury Estate', address: '22 Alderly Terrace, Noosa Heads QLD 4567', soldPrice: 8900000, soldDate: '2026-07-19', bedrooms: 4, bathrooms: 4, parking: 3, landArea: 850, suburb: 'Noosa Heads', image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600', pricePerSqm: 10471, daysOnMarket: 33 },
  { id: 's7', title: 'Vaucluse Cliffside Harbour View Mansion', address: '55 Coolong Road, Vaucluse NSW 2030', soldPrice: 19800000, soldDate: '2026-06-15', bedrooms: 5, bathrooms: 6, parking: 4, landArea: 1100, suburb: 'Vaucluse', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600', pricePerSqm: 18000, daysOnMarket: 61 },
  { id: 's8', title: 'Ascot Grand Queenslander Manor', address: '55 Sutherland Avenue, Ascot QLD 4007', soldPrice: 4750000, soldDate: '2026-07-22', bedrooms: 5, bathrooms: 4, parking: 3, landArea: 1050, suburb: 'Ascot', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600', pricePerSqm: 4524, daysOnMarket: 29 },
  { id: 's9', title: 'Cottesloe Beachfront Architectural Icon', address: '104 Marine Parade, Cottesloe WA 6011', soldPrice: 8200000, soldDate: '2026-08-08', bedrooms: 5, bathrooms: 4, parking: 3, landArea: 790, suburb: 'Cottesloe', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=600', pricePerSqm: 10380, daysOnMarket: 37 },
];

const POPULAR_SOLD_SUBURBS = ['Point Piper', 'Toorak', 'Bondi Beach', 'Mosman', 'Brighton', 'Vaucluse', 'Noosa Heads'];

const SoldPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [suburbQuery, setSuburbQuery] = useState(searchParams.get('suburb') || '');
  const [filtered, setFiltered] = useState(MOCK_SOLD);
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    const s = searchParams.get('suburb') || '';
    setSuburbQuery(s);
    filterResults(s, sortBy);
  }, [searchParams]);

  const filterResults = (suburb, sort) => {
    let results = [...MOCK_SOLD];
    if (suburb) {
      results = results.filter(p =>
        p.suburb.toLowerCase().includes(suburb.toLowerCase()) ||
        p.address.toLowerCase().includes(suburb.toLowerCase())
      );
    }
    results.sort((a, b) => {
      if (sort === 'date_desc') return new Date(b.soldDate) - new Date(a.soldDate);
      if (sort === 'price_desc') return b.soldPrice - a.soldPrice;
      if (sort === 'price_asc') return a.soldPrice - b.soldPrice;
      return 0;
    });
    setFiltered(results);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(suburbQuery ? { suburb: suburbQuery } : {});
    filterResults(suburbQuery, sortBy);
  };

  const handleSort = (s) => {
    setSortBy(s);
    filterResults(suburbQuery, s);
  };

  const totalSoldValue = filtered.reduce((acc, p) => acc + p.soldPrice, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sky-500 text-xs font-bold uppercase tracking-widest">
          <DollarSign className="w-4 h-4" />
          <span>Property Sales History</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Recently Sold Properties</h1>
        <p className="text-slate-500 text-sm">Search recent property sales and auction results across Australia's most prestigious suburbs.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="glass-panel p-5 rounded-2xl border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MapPin className="w-4 h-4 text-sky-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={suburbQuery}
              onChange={(e) => setSuburbQuery(e.target.value)}
              placeholder="Search suburb, street or postcode..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="date_desc">Most Recent First</option>
            <option value="price_desc">Highest Price First</option>
            <option value="price_asc">Lowest Price First</option>
          </select>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-sm hover:from-sky-400 hover:to-sky-500 transition-all flex items-center space-x-2 shadow-lg shadow-sky-500/20"
          >
            <Search className="w-4 h-4" />
            <span>Search Sold</span>
          </button>
        </div>

        {/* Popular suburb pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-semibold self-center">Popular:</span>
          {POPULAR_SOLD_SUBURBS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { setSuburbQuery(s); setSearchParams({ suburb: s }); filterResults(s, sortBy); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                suburbQuery === s ? 'bg-sky-500/20 text-sky-500 border-sky-500/60' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Properties Found</p>
          <p className="text-3xl font-extrabold text-slate-900">{filtered.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Sales Value</p>
          <p className="text-3xl font-extrabold text-sky-500">${(totalSoldValue / 1000000).toFixed(1)}M</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg. Days on Market</p>
          <p className="text-3xl font-extrabold text-slate-900">
            {filtered.length > 0 ? Math.round(filtered.reduce((a, p) => a + p.daysOnMarket, 0) / filtered.length) : 0}
          </p>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-2xl border border-slate-200 space-y-4">
          <Search className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-xl font-bold text-slate-900">No sold properties found</h3>
          <p className="text-sm text-slate-500">Try searching a different suburb or clear your filter.</p>
          <button onClick={() => { setSuburbQuery(''); setSearchParams({}); filterResults('', sortBy); }}
            className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-semibold">
            Showing {filtered.length} sold properties{suburbQuery ? ` in "${suburbQuery}"` : ''}
          </p>
          <div className="space-y-4">
            {filtered.map((property) => (
              <div key={property.id} className="glass-panel rounded-2xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:border-sky-500/30 transition-colors">
                <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0">
                  <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-white/90 text-slate-600 border border-slate-300">
                      SOLD
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{property.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      <span>{property.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{property.bedrooms} bed</span>
                    <span>{property.bathrooms} bath</span>
                    <span>{property.parking} car</span>
                    <span>{property.landArea}m² land</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">Sold Price</p>
                      <p className="text-2xl font-extrabold text-slate-900">${property.soldPrice.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500">${property.pricePerSqm.toLocaleString()}/m²</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Sold {new Date(property.soldDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{property.daysOnMarket} days on market</span>
                      </div>
                    </div>
                    <Link
                      to={`/suburbs/${encodeURIComponent(property.suburb)}`}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-colors"
                    >
                      <span>View Suburb</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoldPage;
