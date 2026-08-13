import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import PropertyFilters from '../components/PropertyFilters';
import { fetchProperties } from '../services/api';
import { Map, Grid, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState(searchParams.get('view') === 'split' ? 'split' : 'grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    suburb: searchParams.get('suburb') || '',
    listingType: searchParams.get('listingType') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    sortBy: 'newest'
  });

  const debounceRef = useRef(null);

  // Sync state with URL if URL changes (e.g. clicking footer links while already on the page)
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      suburb: searchParams.get('suburb') || '',
      listingType: searchParams.get('listingType') || '',
      propertyType: searchParams.get('propertyType') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      sortBy: searchParams.get('sortBy') || 'newest'
    });
  }, [searchParams]);

  // Core fetch function — always takes explicit params so no stale closure issues
  const doFetch = useCallback(async (activeFilters, activePage) => {
    setLoading(true);
    try {
      const params = { page: activePage, limit: 9 };
      if (activeFilters.search)       params.search       = activeFilters.search;
      if (activeFilters.suburb)       params.suburb       = activeFilters.suburb;
      if (activeFilters.listingType)  params.listingType  = activeFilters.listingType;
      if (activeFilters.propertyType) params.propertyType = activeFilters.propertyType;
      if (activeFilters.minPrice)     params.minPrice     = activeFilters.minPrice;
      if (activeFilters.maxPrice)     params.maxPrice     = activeFilters.maxPrice;
      if (activeFilters.bedrooms)     params.bedrooms     = activeFilters.bedrooms;
      if (activeFilters.sortBy && activeFilters.sortBy !== 'newest')
        params.sortBy = activeFilters.sortBy;

      const res = await fetchProperties(params);
      if (res.data.success) {
        setProperties(res.data.properties);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ KEY FIX: Watch filters — auto-fetch with debounce on every filter change
  useEffect(() => {
    // Text inputs (search/suburb/price) get a 400ms debounce to avoid firing on every keystroke
    // Button selections (listingType, propertyType, bedrooms, sortBy) are instant (0ms)
    const isTextChange =
      filters.search !== undefined || filters.suburb !== undefined ||
      filters.minPrice !== undefined || filters.maxPrice !== undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doFetch(filters, 1);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, doFetch]);

  // Re-fetch when page changes (pagination buttons)
  useEffect(() => {
    doFetch(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Reset all filters to blank
  const handleResetFilters = useCallback(() => {
    const cleared = {
      search: '', suburb: '', listingType: '',
      propertyType: '', minPrice: '', maxPrice: '',
      bedrooms: '', sortBy: 'newest'
    };
    setFilters(cleared);
    setPage(1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Explore Luxury Properties</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            {loading
              ? <><Loader2 className="w-3 h-3 animate-spin inline" /> Searching...</>
              : `Showing ${properties.length} of ${total} properties`}
          </p>
        </div>

        {/* View Mode Switchers */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewMode === 'split' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid Only</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Col: Filters */}
        <div className="lg:col-span-4 space-y-6">
          <PropertyFilters
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Col: Results */}
        <div className="lg:col-span-8 space-y-6">

          {/* Map in Split View */}
          {viewMode === 'split' && (
            <div className="h-80 rounded-2xl overflow-hidden border border-slate-800">
              <PropertyMap properties={properties} />
            </div>
          )}

          {/* Property Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 px-6 text-center glass-panel rounded-2xl border border-slate-800 space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Search className="w-7 h-7" />
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-extrabold text-white">
                  {filters.suburb
                    ? `No active properties currently in "${filters.suburb}"`
                    : filters.search
                    ? `No properties found matching "${filters.search}"`
                    : 'No properties match your current criteria'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {filters.suburb
                    ? `We could not find active listings in "${filters.suburb}" right now. Explore other top suburbs below or reset your filter.`
                    : 'Try adjusting your price range, property type, or clearing your keyword filter.'}
                </p>
              </div>

              {/* Suburb Quick Search Pills */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Try Exploring Popular Suburbs
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                  {['Point Piper', 'Barangaroo', 'Bondi Beach', 'Mosman', 'Double Bay', 'South Yarra', 'Broadbeach Waters'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setFilters(prev => ({ ...prev, suburb: sub, search: '' }))}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:text-amber-400 text-xs font-semibold text-slate-300 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>📍</span>
                      <span>{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-extrabold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:border-amber-500/50 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">Page</span>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{page}</span>
                <span className="text-xs font-bold text-slate-400">of {totalPages}</span>
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-extrabold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:border-amber-500/50 hover:text-white transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
