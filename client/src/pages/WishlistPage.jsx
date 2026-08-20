import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Heart, ArrowRight, Sparkles, Building2 } from 'lucide-react';

const WishlistPage = () => {
  const { savedProperties } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block flex items-center space-x-1.5">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>FAVORITE LUXURY PORTFOLIO</span>
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">My Saved Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">
            Properties saved to your personal collection for quick review, price tracking, and scheduling.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-bold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Saved: {savedProperties.length} Properties</span>
          </span>
          <Link
            to="/properties"
            className="px-4 py-2 rounded-2xl bg-sky-500 text-slate-950 font-extrabold text-xs hover:bg-sky-400 transition-all flex items-center space-x-1.5 shadow-md shadow-sky-500/20"
          >
            <Building2 className="w-4 h-4" />
            <span>Browse All Listings</span>
          </Link>
        </div>
      </div>

      {/* Grid or Empty State */}
      {savedProperties.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">Your Saved Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Click the heart icon on any luxury villa, apartment, townhouse, or commercial listing to add it to your saved portfolio.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-black text-xs hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 mt-2"
          >
            <span>Explore Properties Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedProperties.map((p) => (
            <PropertyCard
              key={typeof p === 'object' ? (p._id || p) : p}
              property={typeof p === 'object' ? p : { _id: p, title: 'Saved Luxury Property', price: 1200000, listingType: 'Sale', address: { suburb: 'Sydney', state: 'NSW' } }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
