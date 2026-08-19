import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import PropertyFilters from '../components/PropertyFilters';
import { fetchProperties } from '../services/api';
import { Map, Grid, Search, Loader2, ChevronLeft, ChevronRight, Bell, Share2 } from 'lucide-react';

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState(searchParams.get('view') === 'split' ? 'split' : 'grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    suburb: searchParams.get('suburb') || '',
    listingType: searchParams.get('listingType') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    parking: searchParams.get('parking') || '',
    minLandArea: searchParams.get('minLandArea') || '',
    maxLandArea: searchParams.get('maxLandArea') || '',
    openForInspection: searchParams.get('openForInspection') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest'
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      suburb: searchParams.get('suburb') || '',
      listingType: searchParams.get('listingType') || '',
      propertyType: searchParams.get('propertyType') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      sortBy: searchParams.get('sortBy') || 'newest'
    }));
  }, [searchParams]);

  const doFetch = useCallback(async (activeFilters, activePage) => {
    setLoading(true);
    try {
      const params = { page: activePage, limit: 12 };
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
        let results = res.data.properties;

        // Front-end filters for new params since backend might not support them yet
        if (activeFilters.bathrooms) {
          results = results.filter(p => p.bathrooms >= parseInt(activeFilters.bathrooms));
        }
        if (activeFilters.parking) {
          results = results.filter(p => (p.parkingSpaces || 0) >= parseInt(activeFilters.parking));
        }
        if (activeFilters.minLandArea) {
          results = results.filter(p => (p.landArea || 0) >= parseInt(activeFilters.minLandArea));
        }
        if (activeFilters.maxLandArea) {
          results = results.filter(p => (p.landArea || 0) <= parseInt(activeFilters.maxLandArea));
        }

        setProperties(results);
        setTotalPages(res.data.totalPages);
        setTotal(results.length > 0 ? res.data.total : 0);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doFetch(filters, 1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, doFetch]);

  useEffect(() => {
    doFetch(filters, page);
  }, [page, doFetch, filters]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '', suburb: '', listingType: '', propertyType: '', minPrice: '', maxPrice: '',
      bedrooms: '', bathrooms: '', parking: '', minLandArea: '', maxLandArea: '',
      openForInspection: false, sortBy: 'newest'
    });
    setPage(1);
  }, []);

  return (
    <div className={`${viewMode === 'split' ? 'flex flex-col h-[calc(100vh-64px)]' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-6 space-y-4`}>
      
      {/* Top Search & Filter Bar */}
      <div className={`glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 ${viewMode === 'split' ? 'shrink-0' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              {filters.listingType ? (filters.listingType === 'Sale' ? 'Real Estate & Properties to Buy' : 'Real Estate & Properties for Rent') : 'All Properties'}
              {filters.suburb && <span className="text-amber-400">in {filters.suburb}</span>}
            </h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
              ) : (
                <><span className="font-bold text-white">{total}</span> properties {filters.listingType === 'Rent' ? 'for rent' : 'to buy'}</>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid className="w-3.5 h-3.5" /> <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${viewMode === 'split' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Map className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Map</span>
              </button>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${showFilters ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 border-slate-700 text-white hover:border-amber-500'}`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Horizontal Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
               <PropertyFilters filters={filters} setFilters={setFilters} onReset={handleResetFilters} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'split' ? (
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left: Map */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 shadow-xl hidden lg:block">
            <PropertyMap properties={properties} />
          </div>
          {/* Right: Scrollable Grid */}
          <div className="w-full lg:w-[45%] xl:w-[40%] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1,2,3].map(i => <div key={i} className="h-64 glass-panel rounded-2xl animate-pulse border border-slate-800" />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="py-12 text-center glass-panel rounded-2xl border border-slate-800"><p className="text-slate-400">No properties found.</p></div>
            ) : (
              <div className="flex flex-col gap-4">
                {properties.map(p => <PropertyCard key={p._id} property={p} />)}
              </div>
            )}
            {/* Split view pagination */}
            {!loading && totalPages > 1 && (
               <div className="flex justify-between items-center p-4 glass-panel rounded-2xl border border-slate-800">
                 <button disabled={page <= 1} onClick={() => setPage(p=>p-1)} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white disabled:opacity-50">Prev</button>
                 <span className="text-xs font-bold text-slate-400">{page} of {totalPages}</span>
                 <button disabled={page >= totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white disabled:opacity-50">Next</button>
               </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse border border-slate-800" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-2xl border border-slate-800 space-y-4">
               <Search className="w-12 h-12 mx-auto text-slate-600" />
               <h3 className="text-lg font-bold text-white">No properties match your current criteria</h3>
               <button onClick={handleResetFilters} className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Reset All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}
          
          {/* Grid view pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-extrabold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:border-amber-500/50 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" /><span>Previous</span>
              </button>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">Page</span>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{page}</span>
                <span className="text-xs font-bold text-slate-400">of {totalPages}</span>
              </div>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-extrabold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 hover:border-amber-500/50 hover:text-white transition-all">
                <span>Next</span><ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
