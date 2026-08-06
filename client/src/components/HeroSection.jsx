import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, SlidersHorizontal, Sparkles, ShieldCheck } from 'lucide-react';

const HeroSection = () => {
  const [tab, setTab] = useState('Sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tab) params.append('listingType', tab);
    if (searchQuery) params.append('suburb', searchQuery);
    if (propertyType) params.append('propertyType', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-8 pb-16">
      
      {/* Background Image with Dark Gradient Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Architecture"
          className="w-full h-full object-cover object-center filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border border-amber-500/40 shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            AUSTRALIA'S #1 AI-POWERED LUXURY PROPERTY PORTAL
          </span>
        </motion.div>

        {/* Main Headline */}
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

        {/* Search Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto glass-panel p-4 sm:p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-4"
        >
          {/* Tab buttons */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            {['Sale', 'Rent'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all ${
                  tab === t
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {t === 'Sale' ? 'Buy Property' : 'Rent Property'}
              </button>
            ))}
          </div>

          {/* Form Controls */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-left">
            
            {/* Suburb / Location search */}
            <div className="sm:col-span-6 relative">
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

            {/* Property Type Dropdown */}
            <div className="sm:col-span-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">All Categories</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Apartment">Sky Apartment</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Residential">Residential Home</option>
                <option value="Commercial">Commercial Assets</option>
                <option value="Land">Development Land</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </div>

          </form>

          {/* Quick Suburb Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Trending Locations:</span>
            {['Point Piper', 'Barangaroo', 'South Yarra', 'Sanctuary Cove', 'Manly'].map((suburb) => (
              <button
                key={suburb}
                onClick={() => {
                  setSearchQuery(suburb);
                  navigate(`/properties?suburb=${suburb}`);
                }}
                className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                {suburb}
              </button>
            ))}
          </div>

        </motion.div>

        {/* Animated Metrics */}
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
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 2s</h4>
            <p className="text-xs text-slate-400 mt-0.5">Search Response Time</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
