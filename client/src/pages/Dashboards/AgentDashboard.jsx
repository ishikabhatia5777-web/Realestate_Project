import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchOffers, fetchBookings, fetchProperties, deleteProperty, respondOffer, fetchPaymentHistory, fetchExpertRequests, markExpertRequestAsRead, sendChatMessage, updateBookingStatus } from '../../services/api';
import InboxPanel from '../../components/InboxPanel';
import { Calendar, DollarSign, MessageSquare, Check, X, ShieldCheck, Plus, Building2, Eye, Trash2, Tag, MapPin, CreditCard, Users, UserPlus, Bell, Phone, Mail, Home, User, Edit2 } from 'lucide-react';
import AddPropertyModal from '../../components/AddPropertyModal';
import PaymentModal from '../../components/PaymentModal';
import EditProfileModal from '../../components/EditProfileModal';

const AgentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [offers, setOffers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [expertRequests, setExpertRequests] = useState([]);
  const [expertUnreadCount, setExpertUnreadCount] = useState(0);
  const [activeChatRequest, setActiveChatRequest] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [paymentPackage, setPaymentPackage] = useState('Agency Pro Subscription');
  const [paymentAmount, setPaymentAmount] = useState(499);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'agent') {
        if (user.role === 'super_admin' || user.role === 'admin') navigate('/dashboard/admin');
        else if (user.role === 'agency') navigate('/dashboard/agency');
        else if (user.role === 'seller') navigate('/dashboard/seller');
        else navigate('/dashboard/buyer');
      }
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [pRes, oRes, bRes, txRes, erRes] = await Promise.all([
        fetchProperties({ agentId: user._id, limit: 500 }),
        fetchOffers(),
        fetchBookings(),
        fetchPaymentHistory(),
        fetchExpertRequests()
      ]);
      if (pRes.data && pRes.data.success) setProperties(pRes.data.properties);
      if (oRes.data && oRes.data.success) setOffers(oRes.data.offers);
      if (bRes.data && bRes.data.success) setBookings(bRes.data.bookings);
      if (txRes.data && txRes.data.success) setTransactions(txRes.data.transactions);
      if (erRes.data && erRes.data.success) {
        setExpertRequests(erRes.data.requests || []);
        setExpertUnreadCount(erRes.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error loading agent dashboard data:', err);
    }
  };

  const handleMarkRequestRead = async (id) => {
    try {
      await markExpertRequestAsRead(id);
      setExpertRequests(prev => prev.map(r => r._id === id ? { ...r, isRead: true, status: 'contacted' } : r));
      setExpertUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking request read:', err);
    }
  };

  const handleConnectToChat = async (req) => {
    try {
      const bId = req.buyerId?._id || req.buyerId;
      const pId = req.propertyId?._id || req.propertyId;
      
      // Send the takeover greeting message
      await sendChatMessage({
        receiverId: bId,
        propertyId: pId,
        text: `Hello ${req.buyerName}, I'm ${user.name} and I have joined the chat to assist you with ${req.propertyTitle}. How can I help you today?`
      });

      // Mark request as read
      if (!req.isRead) {
        await handleMarkRequestRead(req._id);
      }

      // Switch to inbox panel and pass the target user
      setActiveChatRequest({ buyerId: bId, propertyId: pId });
      setActiveTab('messages');
      loadData(); // refresh inbox data implicitly

    } catch (err) {
      console.error('Error connecting to chat:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'agent') {
      loadData();
    }
  }, [user]);

  const handlePropertyAdded = (newProperty) => {
    setProperties((prev) => [newProperty, ...prev]);
    window.alert('Success! Your property has been successfully created and published.');
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to remove this property listing?')) return;
    try {
      const res = await deleteProperty(id);
      if (res.data && res.data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };

  const handleOfferAction = async (id, action) => {
    try {
      const res = await respondOffer(id, { action });
      if (res.data && res.data.success) {
        setOffers((prev) => prev.map((o) => (o._id === id ? res.data.offer : o)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      const res = await updateBookingStatus(id, status);
      if (res.data && res.data.success) {
        setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: res.data.booking.status } : b)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPayment = (propId, pkg, amt) => {
    setSelectedPropertyId(propId);
    setPaymentPackage(pkg);
    setPaymentAmount(amt);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
    setIsPaymentModalOpen(false);
    loadData();
  };

  if (authLoading || !user || user.role !== 'agent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">REAL ESTATE AGENT PORTAL</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Agent Property & Pipeline Management</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'properties' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Listed Properties ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === 'messages' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Chat Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'offers' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Customer Offers ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Inspection Schedule ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Payments & Receipts ({transactions.length})
        </button>
        <button
          onClick={() => { setActiveTab('requests'); setExpertUnreadCount(0); }}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 relative ${activeTab === 'requests' ? 'bg-rose-500 text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Connection Requests</span>
          {expertUnreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-slate-900 text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
              {expertUnreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === 'profile' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Agent Profile Settings</h3>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 hover:bg-sky-400 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-300 shrink-0">
              <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-slate-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Listed Properties */}
      {activeTab === 'properties' && (
        <div className="space-y-4">

          {properties.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-xs">No properties listed yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
              >
                Create First Property Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <div key={p._id} className="glass-panel rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 bg-white">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-50/80 backdrop-blur-md text-[11px] font-extrabold text-sky-500 border border-sky-500/20">
                        For {p.listingType}
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-[11px] font-extrabold text-slate-950">
                        {p.status || 'Published'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{p.propertyType} • Tier: {p.tier || 'Standard'}</span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                      <p className="text-base font-extrabold text-sky-500">
                        ${p.price?.toLocaleString()} {p.listingType === 'Rent' ? '/ mo' : ''}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{p.address?.street}, {p.address?.suburb}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex space-x-2">
                      <Link
                        to={`/properties/${p._id}`}
                        className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(p._id)}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-slate-900 transition-all text-xs font-bold flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenPayment(p._id, 'Featured Listing', 99)}
                        className="py-1.5 rounded-lg bg-indigo-600/80 text-slate-900 font-bold text-[11px]"
                      >
                        Feature ($99)
                      </button>
                      <button
                        onClick={() => handleOpenPayment(p._id, 'Premium Listing', 249)}
                        className="py-1.5 rounded-lg brand-gradient-bg text-slate-950 font-extrabold text-[11px]"
                      >
                        Premium ($249)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No buyer offers received yet.
            </div>
          ) : (
            offers.map((offer) => (
              <div key={offer._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{offer.propertyId?.title || 'Property Offer'}</h4>
                  <p className="text-xs text-sky-500 font-extrabold mt-0.5">${offer.offerAmount?.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500">Offered by: {offer.buyerId?.name} ({offer.buyerId?.email})</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-bold text-slate-600">
                    {offer.status}
                  </span>
                  {offer.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleOfferAction(offer._id, 'accept')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleOfferAction(offer._id, 'reject')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 text-slate-900 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No inspection bookings scheduled yet.
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{b.propertyId?.title || 'Property Inspection'}</h4>
                  <p className="text-xs text-sky-500 font-semibold">{b.date} at {b.timeSlot} ({b.type})</p>
                  <p className="text-[11px] text-slate-500">Client: {b.userId?.name} • {b.userId?.phone}</p>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <span className="px-2.5 py-1 rounded bg-white border border-slate-200 text-xs font-bold text-slate-600">
                    {b.status}
                  </span>
                  {b.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleBookingAction(b._id, 'Confirmed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingAction(b._id, 'Rejected')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 text-slate-900 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Agency & Agent Payment Receipts</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-xs">No payment receipts recorded yet.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-600">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/40">
                        <td className="p-4 font-mono text-sky-500">{tx.stripePaymentIntentId || tx._id}</td>
                        <td className="p-4 font-bold text-slate-900">{tx.packageType}</td>
                        <td className="p-4 font-extrabold text-sky-500">AUD ${tx.amount}</td>
                        <td className="p-4">{tx.paymentMethod || 'Credit Card'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase">
                            {tx.status || 'succeeded'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Live Chat Messages Inbox */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Buyer Direct Messages & Inquiries</h3>
          </div>
          <InboxPanel activeChatRequest={activeChatRequest} />
        </div>
      )}



      {/* Tab Content: Expert Connection Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-400" />
                Buyer Connection Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Buyers who asked to connect with you through the 24/7 Live Chat</p>
            </div>
            <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full font-bold">
              {expertRequests.filter(r => !r.isRead).length} Unread
            </span>
          </div>

          {expertRequests.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Bell className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-sm font-medium">No connection requests yet</p>
              <p className="text-slate-500 text-xs">When a buyer clicks "Connect to Expert" in the live chat, their request will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expertRequests.map((req) => (
                <div
                  key={req._id}
                  className={`rounded-2xl border p-5 transition-all ${req.isRead ? 'bg-white/50 border-slate-200' : 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: Buyer info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black shrink-0 ${req.isRead ? 'bg-slate-200 text-slate-600' : 'bg-rose-500/20 text-rose-400'}`}>
                        {(req.buyerName || 'B')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{req.buyerName}</span>
                          {!req.isRead && (
                            <span className="text-[10px] font-black bg-rose-500 text-slate-900 px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">NEW</span>
                          )}
                          {req.status === 'contacted' && (
                            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">Contacted</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {req.buyerEmail && (
                            <a href={`mailto:${req.buyerEmail}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {req.buyerEmail}
                            </a>
                          )}
                        </div>

                        {/* Property */}
                        <div className="flex items-center gap-1 mt-2 text-xs text-sky-500 font-medium">
                          <Home className="w-3 h-3" />
                          <span>{req.propertyTitle || 'Unknown property'}</span>
                        </div>

                        {/* Message */}
                        {req.buyerMessage && (
                          <div className="mt-2 text-xs text-slate-500 italic bg-slate-100/60 rounded-lg px-3 py-2 border border-slate-300/50">
                            "{req.buyerMessage}"
                          </div>
                        )}

                        {/* Time */}
                        <p className="text-[11px] text-slate-500 mt-2">
                          {new Date(req.createdAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {req.buyerEmail && (
                        <a
                          href={`mailto:${req.buyerEmail}?subject=Regarding ${encodeURIComponent(req.propertyTitle || 'your property enquiry')}&body=Hi ${encodeURIComponent(req.buyerName)},%0A%0AThank you for your interest. I'd love to discuss the property with you.%0A%0ABest regards`}
                          onClick={() => !req.isRead && handleMarkRequestRead(req._id)}
                          className="px-3 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 transition-all flex items-center gap-1.5"
                        >
                          <Mail className="w-3 h-3" /> Reply via Email
                        </a>
                      )}
                      {!req.isRead && (
                        <button
                          onClick={() => handleConnectToChat(req)}
                          className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3" /> Approve & Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Property Modal Form */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultPackage={paymentPackage}
        defaultAmount={paymentAmount}
        propertyId={selectedPropertyId}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};

export default AgentDashboard;
