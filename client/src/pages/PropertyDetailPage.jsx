import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import LiveChatModal from '../components/LiveChatModal';
import PaymentModal from '../components/PaymentModal';
import AppraisalReport from '../components/AppraisalReport';
import { useAuth } from '../context/AuthContext';
import { fetchPropertyById, fetchSimilarProperties, generatePropertyAppraisal, sendChatMessage, sendGuestMessage } from '../services/api';
import {
  Bed, Bath, Car, Maximize, MapPin, Calendar, DollarSign, MessageSquare,
  Share2, FileText, Sparkles, ShieldCheck, Check, School, Hospital, Bus, Heart, ShoppingBag, ArrowLeft,
  ChevronLeft, ChevronRight, Phone, Mail, Clock, Map, TrendingUp, X
} from 'lucide-react';

const NEARBY_SCHOOLS = [
  { name: 'Local Public School', type: 'Public Primary', rating: 4.8, distance: '0.8 km' },
  { name: 'High School Academy', type: 'Public Secondary', rating: 4.5, distance: '1.2 km' },
  { name: 'Grammar College', type: 'Private Co-ed', rating: 4.9, distance: '1.6 km' },
];

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, toggleSavedProperty, isSaved, requireAuth } = useAuth();
  const [property, setProperty] = useState(null);
  const [aiValuation, setAiValuation] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [appraisalReport, setAppraisalReport] = useState(null);
  const [appraisalLoading, setAppraisalLoading] = useState(false);
  const [appraisalError, setAppraisalError] = useState(null);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

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

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');

    const combinedMessage = `Property Enquiry:\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;

    const recipient = property?.agentId || property?.ownerId;
    let receiverId = recipient?._id || recipient;

    if (!receiverId || typeof receiverId !== 'string') {
      receiverId = 'default';
    }

    try {
      if (user) {
        await sendChatMessage({
          receiverId,
          propertyId: property?._id,
          text: combinedMessage
        });
        e.target.reset();
        setIsChatOpen(true);
      } else {
        await sendGuestMessage({
          receiverId,
          propertyId: property?._id,
          text: combinedMessage,
          guestName: fullName,
          guestEmail: email,
          guestPhone: phone
        });
        e.target.reset();
        alert('Enquiry sent! The agent has received your message and will contact you shortly.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send enquiry. Please try again.');
    }
  };

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

  const handleGenerateAppraisal = async () => {
    setAppraisalLoading(true);
    setAppraisalError(null);
    try {
      const res = await generatePropertyAppraisal(id);
      if (res.data && res.data.success) {
        setAppraisalReport(res.data.report);
      } else {
        setAppraisalError(res.data.message || 'Failed to generate appraisal.');
      }
    } catch (err) {
      setAppraisalError(err.response?.data?.message || 'An error occurred during appraisal generation.');
    } finally {
      setAppraisalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-bold animate-pulse flex items-center justify-center gap-2">
        <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin inline-block" />
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-xs text-slate-500">The property you requested could not be located.</p>
        <Link to="/properties" className="inline-block px-5 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
          Explore All Properties
        </Link>
      </div>
    );
  }

  const saved = isSaved(property._id);
  const images = property.images?.length > 0 ? property.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-900 hover:bg-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? images.length - 1 : prev - 1); }} 
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-slate-100/80 rounded-full text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img src={images[activeImage]} alt="Gallery Full" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % images.length); }} 
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-slate-100/80 rounded-full text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
            {images.map((_, i) => (
               <div key={i} className={`w-2 h-2 rounded-full ${activeImage === i ? 'bg-sky-400' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div>
        <Link to="/properties" className="inline-flex items-center space-x-2 text-slate-500 hover:text-sky-500 transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </Link>
      </div>

      {/* Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-sky-500/10 text-sky-500 border border-sky-500/30 uppercase tracking-wider">
              {property.listingType === 'Sale' ? 'Buy' : property.listingType} • {property.propertyType}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{property.title}</h1>
          <p className="text-sm text-slate-500 flex items-center space-x-1.5 mt-1">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>{property.address?.street}, {property.address?.suburb}, {property.address?.state} {property.address?.postcode}</span>
          </p>
        </div>

        {/* Price Tag & Action */}
        <div className="text-left md:text-right space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Price Guide</span>
          <p className="text-3xl sm:text-4xl font-extrabold brand-gradient-text">
            ${property.price ? property.price.toLocaleString() : 'Contact Agent'}
          </p>
        </div>
      </div>

      {/* Gallery Carousel Grid */}
      <div className="space-y-4">
        <div 
          className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-slate-200 bg-white cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full border border-slate-300">
              <Maximize className="w-4 h-4 text-slate-900" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">View Fullscreen</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSavedProperty(property._id); }}
            className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border ${
              saved ? 'bg-rose-500 text-slate-900' : 'bg-white/80 text-slate-900 border-slate-300'
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
                activeImage === idx ? 'border-sky-500 scale-105' : 'border-slate-200 opacity-60'
              }`}
            >
              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Specs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-6 glass-panel rounded-2xl border border-slate-200 text-center">
        <div>
          <Bed className="w-6 h-6 text-sky-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 block">{property.bedrooms}</span>
          <span className="text-xs text-slate-500">Bedrooms</span>
        </div>
        <div>
          <Bath className="w-6 h-6 text-sky-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 block">{property.bathrooms}</span>
          <span className="text-xs text-slate-500">Bathrooms</span>
        </div>
        <div>
          <Car className="w-6 h-6 text-sky-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 block">{property.parkingSpaces}</span>
          <span className="text-xs text-slate-500">Parking Spaces</span>
        </div>
        <div>
          <Map className="w-6 h-6 text-sky-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 block">{property.landArea || 450}m²</span>
          <span className="text-xs text-slate-500">Land Area</span>
        </div>
        <div>
          <Calendar className="w-6 h-6 text-sky-500 mx-auto mb-1" />
          <span className="text-lg font-bold text-slate-900 block">{property.yearBuilt || 2022}</span>
          <span className="text-xs text-slate-500">Year Built</span>
        </div>
      </div>

      {/* Split Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Inspection Times Section */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Inspection Times</span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
               <div>
                 <p className="text-sm font-bold text-slate-900">Saturday, 21 Aug</p>
                 <p className="text-xs text-slate-500">10:00 AM - 10:30 AM</p>
               </div>
               <button className="mt-3 sm:mt-0 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-slate-900 transition-colors">
                 Add to Calendar
               </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
               <div>
                 <p className="text-sm font-bold text-slate-900">Wednesday, 25 Aug</p>
                 <p className="text-xs text-slate-500">5:00 PM - 5:30 PM</p>
               </div>
               <button className="mt-3 sm:mt-0 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-slate-900 transition-colors">
                 Add to Calendar
               </button>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">About the Property</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 text-sm sm:text-base whitespace-pre-wrap">
              {property.description}
            </div>
          </div>

          {/* Property Attributes Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Property Type</span>
                <span className="text-sm font-bold text-slate-900">{property.propertyType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Listing Type</span>
                <span className="text-sm font-bold text-slate-900">{property.listingType === 'Sale' ? 'Buy' : property.listingType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Land Size</span>
                <span className="text-sm font-bold text-slate-900">{property.landArea || '450'} m²</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Council Rates</span>
                <span className="text-sm font-bold text-slate-900">$450 / quarter (approx)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Water Rates</span>
                <span className="text-sm font-bold text-slate-900">$180 / quarter (approx)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-sm text-slate-500">Year Built</span>
                <span className="text-sm font-bold text-slate-900">{property.yearBuilt || 2022}</span>
              </div>
            </div>
          </div>

          {/* Appraisal Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-sky-500" />
                <span>AI Property Appraisal</span>
              </h2>
              <button 
                onClick={handleGenerateAppraisal}
                disabled={appraisalLoading}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center"
              >
                {appraisalLoading && <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>}
                {appraisalLoading ? 'Generating...' : 'Generate Appraisal'}
              </button>
            </div>
            
            {appraisalError && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200">
                {appraisalError}
              </div>
            )}
            
            {appraisalReport && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <AppraisalReport reportData={appraisalReport} />
              </div>
            )}
          </div>

          {/* Features */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Features & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.features?.map((feature, i) => (
                <div key={i} className="flex items-center space-x-2 text-slate-600">
                  <Check className="w-5 h-5 text-sky-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Schools */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
             <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
               <School className="w-6 h-6 text-sky-500" />
               <span>Nearby Schools</span>
             </h2>
             <div className="space-y-3">
               {NEARBY_SCHOOLS.map((school, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                   <div>
                     <p className="text-sm font-bold text-slate-900">{school.name}</p>
                     <p className="text-[11px] text-slate-500">{school.type}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-900">{school.distance}</p>
                     <div className="flex items-center justify-end space-x-1 mt-1">
                       <span className="text-[10px] text-slate-500">{school.rating}/5</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="sticky top-24 space-y-6">
            {/* Agent Enquiry Form (Inline) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-sky-500 overflow-hidden mb-3">
                  <img src={property.agentId?.avatar || property.agentId?.profilePicture || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"} alt="Agent" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{property.agentId?.name || 'Real Estate Agent'}</h3>
                <p className="text-xs text-sky-500">{property.agencyId?.name || 'Lead Sales Agent'}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setIsChatOpen(true)} className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button 
                  onClick={() => {
                    if (!showPhone) {
                      setShowPhone(true);
                    } else {
                      window.location.href = 'tel:+61480089451';
                    }
                  }} 
                  className="flex-1 py-3 bg-white border border-slate-300 hover:border-sky-500 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" /> {showPhone ? '+61 480089451' : 'Call'}
                </button>
              </div>

              <form className="space-y-3 pt-4 border-t border-slate-200" onSubmit={handleSendEnquiry}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enquire about this property</p>
                <input type="text" name="fullName" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-500" required />
                <input type="email" name="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-500" required />
                <input type="tel" name="phone" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-500" required />
                <textarea name="message" placeholder="I am interested in this property..." rows="3" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-sky-500 resize-none" required></textarea>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20">
                  Send Enquiry
                </button>
              </form>
            </div>

            {/* Suburb Profile Widget */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-900">Suburb Insights</h3>
               <Link to={`/suburbs/${encodeURIComponent(property.address?.suburb)}`} className="text-xs font-bold text-sky-500 hover:text-amber-300">
                 Full Profile →
               </Link>
             </div>
             <p className="text-sm font-bold text-slate-900">{property.address?.suburb}</p>
             <div className="space-y-3 pt-2">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Median House Price</span>
                 <span className="font-bold text-slate-900">$1.85M</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Annual Growth</span>
                 <span className="font-bold text-emerald-400 flex items-center space-x-1">
                   <TrendingUp className="w-3 h-3" />
                   <span>+12.4%</span>
                 </span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Avg. Days on Market</span>
                 <span className="font-bold text-slate-900">41 Days</span>
               </div>
             </div>
             </div>
          </div>
        </div>

      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Similar Properties You May Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map(p => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <LiveChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        propertyId={id} 
      />

    </div>
  );
};

export default PropertyDetailPage;
