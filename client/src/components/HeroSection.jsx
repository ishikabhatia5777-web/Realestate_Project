import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Bed, Bath, Sparkles, TrendingUp } from 'lucide-react';

const POPULAR_SUBURBS = ['Point Piper', 'Barangaroo', 'South Yarra', 'Sanctuary Cove', 'Manly', 'Noosa Heads'];

const HeroSection = () => {
  const [tab, setTab] = useState('Sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tab === 'Sold') {
      if (searchQuery) params.append('suburb', searchQuery);
      navigate(`/sold?${params.toString()}`);
      return;
    }
    params.append('listingType', tab);
    if (searchQuery) params.append('suburb', searchQuery);
    if (propertyType) params.append('propertyType', propertyType);
    if (bedrooms) params.append('bedrooms', bedrooms);
    if (bathrooms) params.append('bathrooms', bathrooms);
    navigate(`/properties?${params.toString()}`);
  };

  const tabs = [
    { key: 'Sale', label: 'Buy' },
    { key: 'Rent', label: 'Rent' },
    { key: 'Sold', label: 'Sold' },
  ];

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-8 pb-16">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Architecture"
          className="w-full h-full object-cover object-center filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
        >
          Discover Exceptional <br />
          <span className="gold-gradient-text">Real Estate Masterpieces</span>
        </motion.h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore iconic waterfront villas, sky penthouses, and high-yield commercial assets backed by real-time valuation models and verified agency credentials.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto glass-panel p-4 sm:p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4"
        >
          {/* Tab buttons */}
          <div className="flex items-center space-x-1 border-b border-slate-800 pb-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all ${
                  tab === t.key
                    ? t.key === 'Sold'
                      ? 'bg-slate-600 text-white shadow-lg'
                      : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            {/* Row 1: Location + Property Type + Search */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-left">
              <div className="sm:col-span-5 relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Location or Suburb
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Point Piper, Barangaroo, South Yarra..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {tab !== 'Sold' && (
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="">All Types</option>
                    <option value="Villa">Luxury Villa</option>
                    <option value="Apartment">Sky Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Residential">Residential Home</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Land">Development Land</option>
                  </select>
                </div>
              )}

              <div className={`${tab !== 'Sold' ? 'sm:col-span-4' : 'sm:col-span-7'} flex items-end`}>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <Search className="w-4 h-4" />
                  <span>
                    {tab === 'Sold' ? 'Search Sold' : tab === 'Rent' ? 'Search Rentals' : 'Search Properties'}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 2: Beds + Baths */}
            {tab !== 'Sold' && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <Bed className="w-3 h-3" /> Bedrooms
                  </label>
                  <div className="flex gap-1.5">
                    {['Any', '1', '2', '3', '4', '5+'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBedrooms(b === 'Any' ? '' : b.replace('+', ''))}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          (bedrooms === '' && b === 'Any') || bedrooms === b.replace('+', '')
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <Bath className="w-3 h-3" /> Bathrooms
                  </label>
                  <div className="flex gap-1.5">
                    {['Any', '1', '2', '3', '4+'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBathrooms(b === 'Any' ? '' : b.replace('+', ''))}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          (bathrooms === '' && b === 'Any') || bathrooms === b.replace('+', '')
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Trending suburb pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Trending:</span>
            {POPULAR_SUBURBS.map((suburb) => (
              <button
                key={suburb}
                onClick={() => {
                  setSearchQuery(suburb);
                  if (tab === 'Sold') navigate(`/sold?suburb=${suburb}`);
                  else navigate(`/properties?suburb=${suburb}&listingType=${tab}`);
                }}
                className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                {suburb}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto border-t border-slate-800/80">
          <div className="text-center">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white">$4.8B+</h4>
            <p className="text-xs text-slate-400 mt-0.5">Total Property Portfolio</p>
          </div>
          <div className="text-center">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white">98.4%</h4>
            <p className="text-xs text-slate-400 mt-0.5">AI Valuation Accuracy</p>
          </div>
          <div className="text-center">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white">1,250+</h4>
            <p className="text-xs text-slate-400 mt-0.5">Verified Agencies</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white">8.2%</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Avg. Annual Growth</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
