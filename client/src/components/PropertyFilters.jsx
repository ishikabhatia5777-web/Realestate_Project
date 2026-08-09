import React from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

const PropertyFilters = ({ filters, setFilters, onReset }) => {
  const propertyTypes = ['All', 'Residential', 'Villa', 'Apartment', 'Townhouse', 'Farm', 'Land', 'Office'];

  // Generic text/number input change — updates filter state (useEffect in parent auto-fetches)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Button selection — instantly set filter (triggers useEffect auto-fetch in parent)
  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-white font-bold">
          <SlidersHorizontal className="w-5 h-5 text-amber-400" />
          <span>Search & Filter</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center space-x-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Listing Type — instant on click */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Listing Type</label>
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {['All', 'Sale', 'Rent'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter('listingType', type === 'All' ? '' : type)}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                (filters.listingType === type || (type === 'All' && !filters.listingType))
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword Search — debounced via useEffect in parent */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Keyword Search</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="e.g. pool, garden, penthouse..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
          />
        </div>
      </div>

      {/* Suburb / City — debounced via useEffect in parent */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Suburb / City</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            name="suburb"
            value={filters.suburb || ''}
            onChange={handleChange}
            placeholder="e.g. Point Piper, Barangaroo, Mosman..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
          />
        </div>
      </div>

      {/* Property Type — instant on click */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Property Type</label>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((type) => {
            const isSelected = (filters.propertyType === type) || (type === 'All' && !filters.propertyType);
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilter('propertyType', type === 'All' ? '' : type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/60'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range — debounced via useEffect in parent */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Price Range (AUD)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ''}
            onChange={handleChange}
            placeholder="Min Price"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ''}
            onChange={handleChange}
            placeholder="Max Price"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
          />
        </div>
      </div>

      {/* Bedrooms — instant on click */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Bedrooms</label>
        <div className="flex space-x-2">
          {['', '1', '2', '3', '4', '5'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setFilter('bedrooms', num)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                filters.bedrooms === num
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {num === '' ? 'Any' : num === '5' ? '5+' : num}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By — instant on change */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Sort By</label>
        <select
          name="sortBy"
          value={filters.sortBy || 'newest'}
          onChange={handleChange}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
        >
          <option value="newest">Newest Listed</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular / Viewed</option>
        </select>
      </div>


    </div>
  );
};

export default PropertyFilters;
