import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { fetchPropertyById, fetchSimilarProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import EMICalculator from '../components/EMICalculator';
import InspectionBookingModal from '../components/InspectionBookingModal';
import OfferModal from '../components/OfferModal';
import LiveChatModal from '../components/LiveChatModal';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import {
  Bed, Bath, Car, Maximize, MapPin, Calendar, DollarSign, MessageSquare,
  Share2, FileText, Sparkles, ShieldCheck, Check, School, Hospital, Bus, Heart, ShoppingBag, ArrowLeft,
  ChevronLeft, ChevronRight, Phone, Mail
} from 'lucide-react';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, toggleSavedProperty, isSaved, requireAuth } = useAuth();
  const [property, setProperty] = useState(null);
  const [aiValuation, setAiValuation] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('buy') === 'true' && property) {
      if (!user) {
        requireAuth('Please sign in to buy or reserve this property');
        setIsPaymentOpen(false);
      } else {
        setIsPaymentOpen(true);
      }
    }
  }, [searchParams, property, user]);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await fetchPropertyById(id);
        if (res.data && res.data.success) {
          setProperty(res.data.property);
          setAiValuation(res.data.aiValuation);
        }
      } catch (err) {
        console.error('Failed to load property detail:', err);
      } finally {
        setLoading(false);
      }

      // Fetch similar properties separately so main page is never blocked
      try {
        const simRes = await fetchSimilarProperties(id);
        if (simRes.data && simRes.data.success) {
          setSimilarProperties(simRes.data.properties);
        }
      } catch (simErr) {
        console.warn('Could not fetch similar properties:', simErr);
      }
    };

    if (id) {
      loadDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
        <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Property Not Found</h2>
        <p className="text-xs text-slate-400">The property you requested could not be located.</p>
        <Link to="/properties" className="inline-block px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
          Explore All Properties
        </Link>
      </div>
    );
  }

  const saved = isSaved(property._id);
  const images = property.images?.length > 0 ? property.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back Button */}
      <div>
        <Link to="/properties" className="inline-flex items-center space-x-2 text-slate-400 hover:text-amber-400 transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </Link>
      </div>

      {/* Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              {property.listingType} • {property.propertyType}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{property.title}</h1>
          <p className="text-sm text-slate-400 flex items-center space-x-1.5 mt-1">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{property.address?.street}, {property.address?.suburb}, {property.address?.state} {property.address?.postcode}</span>
          </p>
        </div>

        {/* Price Tag & Action */}
        <div className="text-left md:text-right space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Price Guide</span>
          <p className="text-3xl sm:text-4xl font-extrabold gold-gradient-text">
            ${property.price ? property.price.toLocaleString() : 'Contact Agent'}
          </p>
        </div>
      </div>

      {/* Gallery Carousel Grid */}
      <div className="space-y-4">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => toggleSavedProperty(property._id)}
            className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border ${
              saved ? 'bg-rose-500 text-white' : 'bg-slate-900/80 text-white border-slate-700'
            }`}
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                activeImage === idx ? 'border-amber-500 scale-105' : 'border-slate-800 opacity-60'
              }`}
            >
              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Specs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-6 glass-panel rounded-2xl border border-slate-800 text-center">
        <div>
          <Bed className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{property.bedrooms}</span>
          <span className="text-xs text-slate-400">Bedrooms</span>
        </div>
        <div>
          <Bath className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{property.bathrooms}</span>
          <span className="text-xs text-slate-400">Bathrooms</span>
        </div>
        <div>
          <Car className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{property.parkingSpaces}</span>
          <span className="text-xs text-slate-400">Parking Spaces</span>
        </div>
        <div>
          <Maximize className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{property.landArea || 450}m²</span>
          <span className="text-xs text-slate-400">Land Area</span>
        </div>
        <div>
          <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-lg font-bold text-white block">{property.yearBuilt || 2022}</span>
          <span className="text-xs text-slate-400">Year Built</span>
        </div>
      </div>

      {/* Split Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left 8 Cols: Description, Amenities, Map, EMI Calculator */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Property Overview & Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Property Overview</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <h2 className="text-xl font-bold text-white">Features & Luxury Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(property.amenities || ['Swimming Pool', 'Ocean View', 'Wine Cellar', 'Elevator', 'Home Theater', 'Smart Home']).map((am, i) => (
                <div key={i} className="flex items-center space-x-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Map & Nearby Points */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <h2 className="text-xl font-bold text-white">Location & Nearby Infrastructure</h2>
            <div className="h-80 rounded-2xl overflow-hidden border border-slate-800">
              <PropertyMap properties={[property]} center={[property.location?.coordinates?.[1] || -33.8688, property.location?.coordinates?.[0] || 151.2093]} zoom={14} />
            </div>
          </div>

          {/* Mortgage EMI Calculator */}
          <EMICalculator defaultPrice={property.price || 1200000} />

        </div>

        {/* Right 4 Cols: Agent Card & Primary Actions */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          
          {/* Action Box */}
          {(!user || user.role === 'buyer') && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Take Action</h3>
              
              <button
                onClick={() => {
                  if (requireAuth('Sign in to purchase or reserve this property')) {
                    setIsPaymentOpen(true);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>{property.listingType === 'Rent' ? 'Rent Property Now' : 'Buy Property (Reserve Now)'}</span>
              </button>

              <button
                onClick={() => {
                  if (requireAuth('Sign in to submit an offer on this property')) {
                    setIsOfferOpen(true);
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
              >
                Make an Offer
              </button>

              <button
                onClick={() => {
                  if (requireAuth('Sign in to book a private inspection')) {
                    setIsBookingOpen(true);
                  }
                }}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:border-amber-500 transition-colors"
              >
                Book Inspection
              </button>

              <button
                onClick={() => {
                  if (requireAuth('Sign in to start a live chat with this agent')) {
                    setIsChatOpen(true);
                  }
                }}
                className="w-full py-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold text-sm hover:bg-cyan-900/60 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Live Agent Chat</span>
              </button>
            </div>
          )}

          {/* Agent / Agency Card */}
          {property.agentId && (
            <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 shadow-md">
              {/* Header / Logo */}
              <div className="bg-[#fffdf8] p-4 flex justify-center border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  {property.agencyId?.logo ? (
                    <img src={property.agencyId.logo} alt={property.agencyId.name} className="h-8 object-contain" />
                  ) : (
                    <span className="font-black text-slate-900 text-lg tracking-tight uppercase">{property.agencyId?.name || 'Listing Agency'}</span>
                  )}
                </div>
              </div>
              
              {/* Next Inspection Banner */}
              <div className="bg-slate-100 px-4 py-3 flex items-center justify-between text-[13px] border-b border-slate-200">
                <span className="text-slate-700">
                  <strong className="text-slate-900 font-bold">Next Inspection:</strong> Thu 20 Aug, 12:00 PM
                </span>
                <Calendar className="w-5 h-5 text-slate-800" />
              </div>

              <div className="p-6 text-center space-y-5">
                {/* Agent Avatar with Chevrons (Aesthetic) */}
                <div className="flex items-center justify-between">
                  <button className="p-1 text-slate-800 hover:text-slate-600 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <img
                    src={property.agentId.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'}
                    alt={property.agentId.name}
                    className="w-36 h-36 rounded-full object-cover shadow-sm mx-auto"
                  />
                  <button className="p-1 text-slate-800 hover:text-slate-600 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Agent Name & Agency */}
                <div>
                  <h4 className="text-xl font-bold text-[#14234b]">{property.agentId.name}</h4>
                  <p className="text-[13px] text-slate-600 mt-1">{property.agencyId?.name || 'Listing Agent'}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <a href={`tel:${property.agentId.phone || '+61400000000'}`} className="w-full flex items-center justify-center space-x-2 py-3 rounded-md border border-[#14234b] text-[#14234b] font-bold hover:bg-slate-100 transition-colors">
                    <Phone className="w-5 h-5" />
                    <span>Call</span>
                  </a>
                  <a href={`mailto:${property.agentId.email || 'agent@example.com'}`} className="w-full flex items-center justify-center space-x-2 py-3 rounded-md bg-[#e31837] text-white font-bold hover:bg-[#c41530] transition-colors">
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 border-t border-slate-800 pt-10">
          <h2 className="text-2xl font-extrabold text-white">Similar Luxury Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map((simProp) => (
              <PropertyCard key={simProp._id} property={simProp} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <InspectionBookingModal
        property={property}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <OfferModal
        property={property}
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
      />

      <LiveChatModal
        agent={property.agentId || property.ownerId}
        property={property}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <PaymentModal
        propertyId={property._id}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        defaultPackage="Holding Deposit"
        defaultAmount={5000}
        onPaymentSuccess={() => {
          setIsPaymentOpen(false);
          alert('Congratulations! Your holding deposit payment for this property has been received.');
        }}
      />

    </div>
  );
};

export default PropertyDetailPage;
