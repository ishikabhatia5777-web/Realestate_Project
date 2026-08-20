import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Car, Maximize, MapPin, Heart, Sparkles, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PropertyCard = ({ property }) => {
  const { user, toggleSavedProperty, isSaved, requireAuth } = useAuth();
  const saved = isSaved(property._id);

  const formatPrice = (price, listingType, period) => {
    if (!price) return 'Contact Agent';
    const formatted = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(price);
    if (listingType === 'Rent') {
      return `${formatted} / ${period || 'week'}`;
    }
    return formatted;
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group glass-panel rounded-2xl overflow-hidden border border-slate-200/80 hover:border-sky-500/40 transition-all duration-300 shadow-xl"
    >
      {/* Image Container */}
      <Link to={`/properties/${property._id}`} className="block relative aspect-[4/3] overflow-hidden bg-white">
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 backdrop-blur-md text-sky-500 border border-sky-500/30 uppercase tracking-wider">
            {property.listingType === 'Sale' ? 'Buy' : property.listingType}
          </span>
          {property.tier === 'Premium' && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold brand-gradient-bg text-slate-950 flex items-center space-x-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>PREMIUM</span>
            </span>
          )}
          {property.tier === 'Featured' && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-600 text-slate-900">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (requireAuth('Sign in to save properties to your wishlist')) {
              toggleSavedProperty(property._id);
            }
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
            saved
              ? 'bg-rose-500 text-slate-900 border-rose-400'
              : 'bg-white/80 text-slate-600 border-slate-300 hover:text-rose-400 hover:scale-110'
          }`}
          title="Save Property"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

        {/* Price Tag Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <p className="text-xl font-extrabold text-slate-900 tracking-tight drop-shadow-md">
            {formatPrice(property.price, property.listingType, property.pricePeriod)}
          </p>
        </div>

        {/* Agency Logo at Bottom Right */}
        {property.agencyId?.logo && (
          <div className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-lg overflow-hidden border border-white/20 shadow-md bg-white p-0.5">
            <img src={property.agencyId.logo} alt="Agency" className="w-full h-full object-contain" />
          </div>
        )}
      </Link>

      {/* Details Body */}
      <div className="p-5 space-y-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-500/90 block">
            {property.propertyType} • {property.address?.suburb}, {property.address?.state}
          </span>
          <Link to={`/properties/${property._id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-500 transition-colors line-clamp-1 mt-0.5">
              {property.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>{property.address?.street}, {property.address?.suburb}</span>
          </p>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-xl bg-white/60 border border-slate-200/80 text-slate-600 text-xs">
          <div className="flex items-center space-x-1.5" title="Bedrooms">
            <Bed className="w-4 h-4 text-sky-500" />
            <span className="font-semibold">{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Bathrooms">
            <Bath className="w-4 h-4 text-sky-500" />
            <span className="font-semibold">{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Parking Spaces">
            <Car className="w-4 h-4 text-sky-500" />
            <span className="font-semibold">{property.parkingSpaces}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Land Area (sqm)">
            <Maximize className="w-4 h-4 text-sky-500" />
            <span className="font-semibold">{property.landArea || property.floorArea || 0}m²</span>
          </div>
        </div>

        {/* Footer info: Action links */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-200/60">
          <div className="flex items-center space-x-2">
            <Link
              to={`/properties/${property._id}`}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View Details
            </Link>
            {(!user || user.role === 'buyer') && (
              <Link
                to={`/properties/${property._id}?buy=true`}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    requireAuth('Please sign in to buy or reserve this property');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs hover:from-sky-400 hover:to-sky-500 transition-all shadow-md shadow-sky-500/20 flex items-center space-x-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{property.listingType === 'Rent' ? 'Rent Now' : 'Buy Property'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
