import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProperties, deleteProperty, fetchPaymentHistory, fetchOffers, respondOffer } from '../../services/api';
import { Plus, Sparkles, DollarSign, CheckCircle, Building2, Eye, Trash2, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import AddPropertyModal from '../../components/AddPropertyModal';
import PaymentModal from '../../components/PaymentModal';

const SellerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [paymentPackage, setPaymentPackage] = useState('Featured Listing');
  const [paymentAmount, setPaymentAmount] = useState(99);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'seller') {
        if (user.role === 'super_admin' || user.role === 'admin') navigate('/dashboard/admin');
        else if (user.role === 'agency') navigate('/dashboard/agency');
        else if (user.role === 'agent') navigate('/dashboard/agent');
        else navigate('/dashboard/buyer');
      }
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [pRes, txRes, oRes] = await Promise.all([
        fetchProperties({ ownerId: user?._id }),
        fetchPaymentHistory(),
        fetchOffers()
      ]);
      if (pRes.data && pRes.data.success) {
        setProperties(pRes.data.properties);
      }
      if (txRes.data && txRes.data.success) {
        setTransactions(txRes.data.transactions);
      }
      if (oRes.data && oRes.data.success) {
        setOffers(oRes.data.offers);
      }
    } catch (err) {
      console.error('Error loading seller dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'seller') {
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

  const handleOfferAction = async (offerId, action) => {
    try {
      const res = await respondOffer(offerId, { action });
      if (res.data.success) {
        loadData();
      }
    } catch (err) {
      console.error('Error responding to offer:', err);
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

  if (authLoading || !user || user.role !== 'seller') {
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
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">FSBO SELLER PORTAL</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Direct Property Seller Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add FSBO Property</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'properties' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Your Listed Properties ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'offers' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Offers Received ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Payment & Transactions ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Listed Properties Grid */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Listed Properties in Database</h3>
            <span className="text-xs text-slate-500">Total Listed: {properties.length}</span>
          </div>

          {properties.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-xs">No properties listed yet. Click "Add FSBO Property" to publish your first property.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
              >
                Add First Property
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
                        For {p.listingType || 'Sale'}
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
                        className="py-1.5 rounded-lg bg-indigo-600/80 text-slate-900 font-bold text-[11px] hover:bg-indigo-600"
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

      {/* Tab 2: Offers Received */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Purchase & Rental Offers Received</h3>
            <span className="text-xs text-slate-500">Total: {offers.length}</span>
          </div>

          {offers.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No buyer offers received yet on your listed properties.
            </div>
          ) : (
            offers.map((offer) => (
              <div key={offer._id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{offer.propertyId?.title || 'Property Offer'}</h4>
                  <p className="text-xs text-sky-500 font-extrabold mt-0.5">${offer.offerAmount?.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500">Offered by: {offer.buyerId?.name || 'Buyer'} ({offer.buyerId?.email || 'N/A'})</p>
                  {offer.conditions && (
                    <p className="text-[11px] text-slate-600 italic mt-1">"{offer.conditions}"</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded border text-xs font-bold ${
                    offer.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    offer.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    'bg-sky-500/10 text-sky-500 border-sky-500/30'
                  }`}>
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

      {/* Tab 2: Payments & Transactions */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Payment & Billing History</h3>
            <button
              onClick={() => handleOpenPayment(null, 'Featured Listing', 99)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
            >
              Make New Payment
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-xs">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Package Purpose</th>
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
    </div>
  );
};

export default SellerDashboard;
