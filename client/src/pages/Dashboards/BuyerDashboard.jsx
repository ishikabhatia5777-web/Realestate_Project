import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchOffers, fetchBookings, fetchPaymentHistory } from '../../services/api';
import InboxPanel from '../../components/InboxPanel';
import { Heart, Calendar, DollarSign, FileText, CheckCircle, Search, MapPin, Eye, ArrowRight, CreditCard, Lock, MessageSquare } from 'lucide-react';
import PaymentModal from '../../components/PaymentModal';

const BuyerDashboard = () => {
  const { user, loading: authLoading, savedProperties } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [offers, setOffers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'offers');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [paymentPackage, setPaymentPackage] = useState('Holding Deposit');
  const [paymentAmount, setPaymentAmount] = useState(5000);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'buyer') {
        if (user.role === 'super_admin' || user.role === 'admin') navigate('/dashboard/admin');
        else if (user.role === 'agency') navigate('/dashboard/agency');
        else if (user.role === 'agent') navigate('/dashboard/agent');
        else if (user.role === 'seller') navigate('/dashboard/seller');
      }
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [oRes, bRes, txRes] = await Promise.all([
        fetchOffers(),
        fetchBookings(),
        fetchPaymentHistory()
      ]);
      if (oRes.data && oRes.data.success) setOffers(oRes.data.offers);
      if (bRes.data && bRes.data.success) setBookings(bRes.data.bookings);
      if (txRes.data && txRes.data.success) setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Error loading buyer dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'buyer') {
      loadData();
    }
  }, [user]);

  const handleOpenPayment = (propId, pkg = 'Holding Deposit', amt = 5000) => {
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

  if (authLoading || !user || user.role !== 'buyer') {
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">BUYER & RENTER PORTAL</span>
          <h1 className="text-3xl font-extrabold text-slate-900">My Property Portfolio & Applications</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenPayment(null, 'Holding Deposit', 5000)}
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sky-500 font-extrabold text-xs flex items-center space-x-2 hover:border-sky-500/50 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Property Holding Deposit</span>
          </button>
          <Link
            to="/properties"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
          >
            <Search className="w-4 h-4" />
            <span>Explore All Properties</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'offers' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          My Submitted Offers ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === 'messages' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Agent Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Inspection Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'wishlist' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Saved Wishlist ({savedProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Payment History ({transactions.length})
        </button>
      </div>

      {/* Tab: Live Agent Chat Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Live Agent & Seller Communications</h3>
          </div>
          <InboxPanel />
        </div>
      )}

      {/* Tab 1: My Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Submitted Purchase & Rental Offers</h3>
            <span className="text-xs text-slate-500">Total: {offers.length}</span>
          </div>

          {offers.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-4 max-w-2xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-500">
                <DollarSign className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">No Offers Submitted Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When you browse property listings and click <span className="text-sky-500 font-bold">"Make an Offer"</span>, your price proposal and agent responses will show up here.
                </p>
              </div>
              <Link
                to="/properties"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors shadow-md"
              >
                <span>Browse Properties & Submit Offer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    {offer.propertyId?.images?.[0] && (
                      <img
                        src={offer.propertyId.images[0]}
                        alt={offer.propertyId.title}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                      />
                    )}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">{offer.propertyId?.title || 'Property Offer'}</h4>
                      <p className="text-xs text-sky-500 font-extrabold">
                        Offered Amount: ${offer.offerAmount?.toLocaleString()}
                      </p>
                      {offer.propertyId?.address && (
                        <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{offer.propertyId.address.street}, {offer.propertyId.address.suburb}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">Conditions: {offer.conditions}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenPayment(offer.propertyId?._id, 'Holding Deposit', 5000)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 flex items-center space-x-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pay Deposit ($5,000)</span>
                    </button>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase border ${
                      offer.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : offer.status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inspection Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Scheduled Inspection Appointments</h3>
            <span className="text-xs text-slate-500">Total: {bookings.length}</span>
          </div>

          {bookings.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-4 max-w-2xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">No Inspections Scheduled</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When you view a property listing and click <span className="text-cyan-400 font-bold">"Book Inspection"</span>, your confirmed inspection times and site visits will appear here.
                </p>
              </div>
              <Link
                to="/properties"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors shadow-md"
              >
                <span>Find Properties to Inspect</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.propertyId?.title || 'Property Inspection'}</h4>
                    <p className="text-xs text-sky-500 font-semibold">{b.date} at {b.timeSlot} ({b.type})</p>
                    {b.propertyId?.address && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Location: {b.propertyId.address.street}, {b.propertyId.address.suburb}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Saved Properties</h3>
            <span className="text-xs text-slate-500">Saved: {savedProperties.length}</span>
          </div>

          {savedProperties.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-4 max-w-2xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">Your Saved Wishlist is Empty</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the heart icon on any property card to save your favorite luxury villas, apartments, and homes here.
                </p>
              </div>
              <Link
                to="/properties"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors shadow-md"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.map((p) => (
                <PropertyCard key={p._id || p} property={typeof p === 'object' ? p : { _id: p, title: 'Saved Property' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Payments & History */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Payment Receipts & Deposits</h3>
            <button
              onClick={() => handleOpenPayment(null, 'Holding Deposit', 5000)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
            >
              Pay Holding Deposit
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-xs">No payment history found.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Receipt / Invoice ID</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Amount Paid</th>
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultPackage={paymentPackage}
        defaultAmount={paymentAmount}
        propertyId={selectedPropertyId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BuyerDashboard;
