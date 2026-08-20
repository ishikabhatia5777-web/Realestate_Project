import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, TrendingUp } from 'lucide-react';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('listingType', 'Sale');
    if (searchQuery) params.append('suburb', searchQuery);
    if (propertyType) params.append('propertyType', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 pt-8 pb-16">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000"
          alt="Bright Modern Architecture"
          className="w-full h-full object-cover object-center filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
        >
          Discover Exceptional <br />
          <span className="brand-gradient-text">Real Estate Masterpieces</span>
        </motion.h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore iconic waterfront villas, sky penthouses, and high-yield commercial assets backed by real-time valuation models and verified agency credentials.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto glass-panel p-4 sm:p-6 rounded-3xl border border-slate-300/80 shadow-2xl space-y-4"
        >
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Location + Property Type + Search */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-left">
              <div className="sm:col-span-5 relative">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Location or Suburb
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-sky-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Point Piper, Barangaroo, South Yarra..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
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

              <div className="sm:col-span-4 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold text-xs uppercase tracking-wider hover:from-sky-400 hover:to-sky-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto border-t border-white/20">
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
