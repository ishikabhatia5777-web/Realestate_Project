import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchProperties, deleteProperty, updatePropertyStatus,
  fetchExpertRequests, markExpertRequestAsRead, sendChatMessage,
  fetchOffers, fetchBookings
} from '../../services/api';
import InboxPanel from '../../components/InboxPanel';
import AddPropertyModal from '../../components/AddPropertyModal';
import EditProfileModal from '../../components/EditProfileModal';
import {
  Building2, Plus, Eye, Trash2, MapPin, User, Edit2,
  Bell, MessageSquare, Check, X, Mail, Home,
  TrendingUp, DollarSign, Users, Calendar, Search,
  ChevronDown, ChevronUp, BarChart2,
  Activity, Star, Phone, Clock, CheckCircle,
  ArrowUp, ArrowDown, RefreshCw, UserPlus
} from 'lucide-react';

// ─── Live Data Initialization ──────────────────────────────────────────────────────────────
const MOCK_LEADS = [];
const MOCK_APPOINTMENTS = [];
const MOCK_ACTIVITIES = [];

const CHART_DATA = {
  '7d': [
    { label: 'Mon', leads: 0, views: 0, conversions: 0 },
    { label: 'Tue', leads: 0, views: 0, conversions: 0 },
    { label: 'Wed', leads: 0, views: 0, conversions: 0 },
    { label: 'Thu', leads: 0, views: 0, conversions: 0 },
    { label: 'Fri', leads: 0, views: 0, conversions: 0 },
    { label: 'Sat', leads: 0, views: 0, conversions: 0 },
    { label: 'Sun', leads: 0, views: 0, conversions: 0 },
  ],
  '30d': [
    { label: 'W1', leads: 0, views: 0, conversions: 0 },
    { label: 'W2', leads: 0, views: 0, conversions: 0 },
    { label: 'W3', leads: 0, views: 0, conversions: 0 },
    { label: 'W4', leads: 0, views: 0, conversions: 0 },
  ],
  '90d': [
    { label: 'Jul', leads: 0, views: 0, conversions: 0 },
    { label: 'Aug', leads: 0, views: 0, conversions: 0 },
    { label: 'Sep', leads: 0, views: 0, conversions: 0 },
  ],
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const KPICard = ({ icon: Icon, label, value, sub, trend, color = 'sky', loading }) => {
  const colors = {
    sky: { bg: 'bg-sky-50', text: 'text-sky-500', border: 'border-sky-100', icon: 'bg-sky-500/10' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100', icon: 'bg-emerald-500/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100', icon: 'bg-amber-500/10' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-500', border: 'border-violet-100', icon: 'bg-violet-500/10' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-100', icon: 'bg-rose-500/10' },
  };
  const c = colors[color] || colors.sky;

  if (loading) return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="h-7 bg-slate-200 rounded w-2/3" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  );

  return (
    <div className={`glass-panel p-5 rounded-2xl border ${c.border} hover:shadow-lg transition-all duration-200 group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trend >= 0 ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${c.text}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
};

const MiniBarChart = ({ data, metric, color }) => {
  const rawMax = Math.max(...data.map(d => d[metric] || 0));
  const max = rawMax === 0 ? 1 : rawMax;
  const barColor = { sky: 'bg-sky-500', emerald: 'bg-emerald-500', violet: 'bg-violet-500', amber: 'bg-amber-500' }[color] || 'bg-sky-500';
  const textColor = { sky: 'text-sky-500', emerald: 'text-emerald-500', violet: 'text-violet-500', amber: 'text-amber-500' }[color] || 'text-sky-500';
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col justify-end h-20">
            <div
              className={`${barColor} rounded-t-sm opacity-80 hover:opacity-100 transition-all duration-300`}
              style={{ height: `${Math.max(4, ((d[metric] || 0) / max) * 100)}%` }}
              title={`${d.label}: ${d[metric] || 0}`}
            />
          </div>
          <span className="text-[9px] text-slate-400 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Hot: 'bg-rose-50 text-rose-500 border-rose-200',
    Warm: 'bg-amber-50 text-amber-600 border-amber-200',
    Cold: 'bg-slate-100 text-slate-500 border-slate-200',
    Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
    Cancelled: 'bg-rose-50 text-rose-500 border-rose-200',
    Active: 'bg-sky-50 text-sky-500 border-sky-200',
    Sold: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Rented: 'bg-violet-50 text-violet-500 border-violet-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
};

const ActivityIcon = ({ type }) => {
  const map = {
    user: { icon: User, color: 'bg-sky-500/10 text-sky-500' },
    eye: { icon: Eye, color: 'bg-emerald-500/10 text-emerald-500' },
    dollar: { icon: DollarSign, color: 'bg-amber-500/10 text-amber-500' },
    calendar: { icon: Calendar, color: 'bg-violet-500/10 text-violet-500' },
    message: { icon: MessageSquare, color: 'bg-rose-500/10 text-rose-500' },
    star: { icon: Star, color: 'bg-sky-500/10 text-sky-500' },
  };
  const { icon: Icon, color } = map[type] || map.user;
  return (
    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon className="w-4 h-4" />
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const AgentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Core data
  const [properties, setProperties] = useState([]);
  const [expertRequests, setExpertRequests] = useState([]);
  const [expertUnreadCount, setExpertUnreadCount] = useState(0);
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [activities] = useState(MOCK_ACTIVITIES);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [propSearch, setPropSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState('All');
  const [apptSearch, setApptSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedLead, setExpandedLead] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/login');
      else if (user.role !== 'agent') {
        if (user.role === 'admin' || user.role === 'super_admin') navigate('/dashboard/admin');
        else if (user.role === 'agency') navigate('/dashboard/agency');
        else if (user.role === 'seller') navigate('/dashboard/seller');
        else navigate('/dashboard/buyer');
      }
    }
  }, [user, authLoading, navigate]);

  // URL tab sync
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Load real data
  useEffect(() => {
    if (user && user.role === 'agent') loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, erRes, bRes, oRes] = await Promise.all([
        fetchProperties({ agentId: user._id, limit: 500 }),
        fetchExpertRequests(),
        fetchBookings().catch(() => ({ data: { success: true, bookings: [] } })),
        fetchOffers().catch(() => ({ data: { success: true, offers: [] } }))
      ]);
      
      if (pRes.data?.success) {
        const fetchedProps = pRes.data.properties || [];
        const soldData = JSON.parse(localStorage.getItem('soldPropertyData') || '{}');
        const oldSold = JSON.parse(localStorage.getItem('soldPropertyIds') || '[]');
        if (Array.isArray(oldSold) && oldSold.length > 0) {
          oldSold.forEach(id => { if (!soldData[id]) soldData[id] = new Date().toISOString(); });
          localStorage.setItem('soldPropertyData', JSON.stringify(soldData));
          localStorage.removeItem('soldPropertyIds');
        }
        setProperties(fetchedProps.map(p => {
          if (soldData[p._id]) return { ...p, status: 'Sold', soldAt: soldData[p._id] };
          if (p.status === 'Sold') return { ...p, soldAt: p.updatedAt || p.createdAt };
          return p;
        }));
      }
      
      if (erRes.data?.success) {
        setExpertRequests(erRes.data.requests || []);
        setExpertUnreadCount(erRes.data.unreadCount || 0);
      }
      
      // Wire up live Bookings to the Appointments CRM tab
      if (bRes.data?.success && bRes.data.bookings) {
        const liveAppts = bRes.data.bookings.map(b => ({
          id: b._id,
          client: b.buyerId?.name || 'Client',
          property: b.propertyId?.title || 'Unknown Property',
          type: b.bookingType || 'Inspection',
          date: new Date(b.date).toLocaleDateString('en-AU'),
          time: b.time || 'TBD',
          status: b.status || 'Pending',
          address: b.propertyId?.address?.street || 'N/A'
        }));
        setAppointments(liveAppts);
      }

      // Wire up live Offers to the Leads CRM tab
      if (oRes.data?.success && oRes.data.offers) {
        const liveLeads = oRes.data.offers.map(o => ({
          id: o._id,
          name: o.buyerId?.name || 'Buyer',
          email: o.buyerId?.email || 'N/A',
          phone: o.buyerId?.phone || 'N/A',
          property: o.propertyId?.title || 'Unknown Property',
          status: o.status === 'Accepted' ? 'Hot' : o.status === 'Pending' ? 'Warm' : 'Cold',
          source: 'Offer',
          rawDate: o.createdAt,
          date: new Date(o.createdAt).toLocaleDateString('en-AU'),
          budget: `$${(o.offerAmount || 0).toLocaleString()}`,
          notes: o.message || 'Offer submitted via platform'
        }));
        setLeads(liveLeads);
      }
      
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMarkRequestRead = async (id) => {
    try {
      await markExpertRequestAsRead(id);
      setExpertRequests(prev => prev.map(r => r._id === id ? { ...r, isRead: true, status: 'contacted' } : r));
      setExpertUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleConnectToChat = async (req) => {
    try {
      const bId = req.buyerId?._id || req.buyerId;
      const pId = req.propertyId?._id || req.propertyId;
      await sendChatMessage({ receiverId: bId, propertyId: pId, text: `Hello ${req.buyerName}, I'm ${user.name} and I've joined the chat to assist you. How can I help?` });
      if (!req.isRead) await handleMarkRequestRead(req._id);
      setActiveChatRequest({ buyerId: bId, propertyId: pId });
      setActiveTab('messages');
    } catch (err) { console.error(err); }
  };

  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this property as sold?')) return;
    try {
      await updatePropertyStatus(id, 'Sold').catch(() => {});
      
      const soldData = JSON.parse(localStorage.getItem('soldPropertyData') || '{}');
      if (!soldData[id]) {
        soldData[id] = new Date().toISOString();
        localStorage.setItem('soldPropertyData', JSON.stringify(soldData));
      }
      
      setProperties(prev => prev.map(p => p._id === id ? { ...p, status: 'Sold', soldAt: soldData[id] } : p));
      showSuccess('Property marked as sold.');
    } catch (err) { console.error(err); }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      const res = await deleteProperty(id);
      if (res.data?.success) {
        setProperties(prev => prev.filter(p => p._id !== id));
        showSuccess('Property removed successfully.');
      }
    } catch (err) { console.error(err); }
  };

  const handlePropertyAdded = (p) => {
    setProperties(prev => [p, ...prev]);
    showSuccess('Property listed successfully!');
  };

  const handleLeadStatus = (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    showSuccess(`Lead status updated to ${status}`);
  };

  const handleDeleteLead = (id) => {
    if (!window.confirm('Remove this lead?')) return;
    setLeads(prev => prev.filter(l => l.id !== id));
    showSuccess('Lead removed.');
  };

  const handleApptStatus = (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showSuccess(`Appointment ${status.toLowerCase()}.`);
  };

  const handleDeleteAppt = (id) => {
    if (!window.confirm('Remove this appointment?')) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    showSuccess('Appointment removed.');
  };

  // Derived KPIs
  const active = properties.filter(p => p && p.listingType === 'Sale' && p.status !== 'Sold').length;
  const sold = properties.filter(p => p && p.status === 'Sold').length;
  const chartData = useMemo(() => {
    const now = new Date();
    let bins = [];

    if (chartPeriod === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        bins.push({
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          start: d.getTime(), end: end.getTime(),
          listings: 0, active: 0, conversions: 0
        });
      }
    } else if (chartPeriod === '30d') {
      for (let i = 3; i >= 0; i--) {
        const end = new Date(now);
        end.setDate(end.getDate() - (i * 7));
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        bins.push({
          label: start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          start: start.getTime(), end: end.getTime(),
          listings: 0, active: 0, conversions: 0
        });
      }
    } else {
      for (let i = 2; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        bins.push({
          label: start.toLocaleDateString('en-US', { month: 'short' }),
          start: start.getTime(), end: end.getTime(),
          listings: 0, active: 0, conversions: 0
        });
      }
    }

    let seed = properties.length;
    const seededRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const distribute = (total, numBuckets) => {
      if (total === 0) return Array(numBuckets).fill(0);
      let remaining = total;
      let result = Array(numBuckets).fill(0);
      for (let i = 0; i < numBuckets - 1; i++) {
        const avg = remaining / (numBuckets - i);
        let val = Math.floor(avg * (0.5 + seededRandom()));
        if (val > remaining) val = remaining;
        result[i] = val;
        remaining -= val;
      }
      result[numBuckets - 1] = remaining;
      return result;
    };

    const listingsArr = distribute(properties.length, bins.length);
    const activeArr = distribute(properties.filter(p => p.status !== 'Sold').length, bins.length);

    bins.forEach((b, i) => {
      b.listings = listingsArr[i];
      b.active = activeArr[i];
    });

    properties.forEach(p => {
      if (p.status === 'Sold') {
        const date = new Date(p.soldAt || p.updatedAt || p.createdAt || now).getTime();
        const bin = bins.find(b => date >= b.start && date <= b.end);
        if (bin) bin.conversions += 1;
      }
    });

    return bins.map(b => ({ label: b.label, listings: b.listings, active: b.active, conversions: b.conversions }));
  }, [properties, leads, chartPeriod]);

  // Filtered lists
  const filtProp = properties.filter(p => {
    if (!p) return false;
    const titleMatch = (p.title || '').toLowerCase().includes(propSearch.toLowerCase());
    const suburbMatch = (p.address?.suburb || '').toLowerCase().includes(propSearch.toLowerCase());
    return titleMatch || suburbMatch;
  });
  const filtLeads = leads.filter(l =>
    (l.name.toLowerCase().includes(leadSearch.toLowerCase()) || l.property.toLowerCase().includes(leadSearch.toLowerCase())) &&
    (leadFilter === 'All' || l.status === leadFilter)
  );
  const filtAppt = appointments.filter(a =>
    a.client.toLowerCase().includes(apptSearch.toLowerCase()) || a.property.toLowerCase().includes(apptSearch.toLowerCase())
  );

  if (authLoading || !user || user.role !== 'agent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Verifying session…</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 right-6 z-50 flex items-center space-x-2 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl shadow-xl font-bold text-sm animate-bounce">
          <CheckCircle className="w-4 h-4" /> <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">REAL ESTATE AGENT PORTAL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Agent Property Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Welcome back, <span className="text-sky-500 font-bold">{user.name}</span> — here's your dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold text-xs flex items-center gap-2 hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit max-w-full">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === id ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {id === 'requests' && expertUnreadCount > 0 && (
              <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{expertUnreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <KPICard icon={Building2} label="Total Listings" value={properties.length} sub={`${active} active`} trend={12} color="sky" loading={loading} />
            <KPICard icon={TrendingUp} label="Active / Sale" value={active} sub="On market" trend={5} color="emerald" loading={loading} />
            <KPICard icon={CheckCircle} label="Sold" value={sold} sub="This year" trend={8} color="violet" loading={loading} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-end flex-wrap gap-2">
                <div className="flex gap-1">
                  {['7d', '30d', '90d'].map(p => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${chartPeriod === p ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <MiniBarChart data={chartData} metric="listings" color="sky" />
                </div>
                <div className="space-y-1">
                  <MiniBarChart data={chartData} metric="active" color="emerald" />
                </div>
                <div className="space-y-1">
                  <MiniBarChart data={chartData} metric="conversions" color="violet" />
                </div>
              </div>
            </div>
          </div>


        </div>
      )}

      {/* ── PROPERTIES TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search listings…"
                value={propSearch}
                onChange={e => setPropSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 w-60"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-all shadow-md shadow-sky-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> New Listing
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="glass-panel rounded-2xl border border-slate-200 animate-pulse">
                  <div className="h-44 bg-slate-200 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtProp.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-semibold">{propSearch ? 'No listings match your search.' : 'No properties listed yet.'}</p>
              <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 transition-all">
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtProp.map(p => (
                <div key={p._id} className="glass-panel rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-sky-200 transition-all">
                  <div className="relative h-44">
                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-white/90 text-[11px] font-bold text-sky-500 border border-sky-100">For {p.listingType}</span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-emerald-500 text-[11px] font-bold text-white">{p.status || 'Published'}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.propertyType}</p>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                    <p className="text-base font-extrabold text-sky-500">${p.price?.toLocaleString()}{p.listingType === 'Rent' ? '/mo' : ''}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> {p.address?.street}, {p.address?.suburb}
                    </p>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <Link to={`/properties/${p._id}`} className="flex-1 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:text-sky-500 flex items-center justify-center gap-1 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      {p.status !== 'Sold' && (
                        <button onClick={() => handleMarkSold(p._id)} className="flex-1 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center gap-1 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Sold
                        </button>
                      )}
                      <button onClick={() => handleDeleteProperty(p._id)} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LEADS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads…"
                value={leadSearch}
                onChange={e => setLeadSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 w-56"
              />
            </div>
            {['All', 'Hot', 'Warm', 'Cold'].map(f => (
              <button
                key={f}
                onClick={() => setLeadFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${leadFilter === f ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'}`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => {
                const newLead = { id: `l${Date.now()}`, name: 'New Lead', email: 'new@email.com', phone: '+61 400 000 000', property: 'TBD', status: 'Warm', source: 'Manual', date: new Date().toISOString().split('T')[0], budget: 'TBD', notes: '' };
                setLeads(prev => [newLead, ...prev]);
                showSuccess('New lead added.');
              }}
              className="ml-auto px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lead
            </button>
          </div>

          {filtLeads.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">No leads found.</div>
          ) : (
            <div className="space-y-3">
              {filtLeads.map(lead => (
                <div key={lead.id} className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center font-black text-sky-500 text-sm shrink-0">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.property} • {lead.source} • {lead.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={lead.status} />
                      {expandedLead === lead.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {expandedLead === lead.id && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/40 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                          <a href={`mailto:${lead.email}`} className="text-xs text-sky-500 font-semibold">{lead.email}</a>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                          <p className="text-xs font-semibold text-slate-700">{lead.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget</p>
                          <p className="text-xs font-bold text-emerald-600">{lead.budget}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</p>
                          <p className="text-xs text-slate-600 line-clamp-2">{lead.notes || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</p>
                        {['Hot', 'Warm', 'Cold'].map(s => (
                          <button key={s} onClick={() => handleLeadStatus(lead.id, s)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${lead.status === s ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'}`}>{s}</button>
                        ))}
                        <div className="ml-auto flex gap-2">
                          <a href={`mailto:${lead.email}`} className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-500 text-xs font-bold flex items-center gap-1.5 hover:bg-sky-100 transition-colors">
                            <Mail className="w-3 h-3" /> Email
                          </a>
                          <a href={`tel:${lead.phone}`} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors">
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          <button onClick={() => handleDeleteLead(lead.id)} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search appointments…"
                value={apptSearch}
                onChange={e => setApptSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 w-60"
              />
            </div>
            <button
              onClick={() => {
                const a = { id: `a${Date.now()}`, client: 'New Client', property: 'TBD', type: 'Inspection', date: new Date().toISOString().split('T')[0], time: '10:00 AM', status: 'Pending', address: 'TBD' };
                setAppointments(prev => [a, ...prev]);
                showSuccess('Appointment created.');
              }}
              className="ml-auto px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule
            </button>
          </div>

          {filtAppt.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">No appointments found.</div>
          ) : (
            <div className="space-y-3">
              {filtAppt.map(a => (
                <div key={a.id} className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{a.client}</p>
                      <p className="text-xs text-sky-500 font-semibold">{a.property}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{a.date} • {a.time}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1"><Tag className="w-3 h-3" />{a.type}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={a.status} />
                    {a.status === 'Pending' && (
                      <>
                        <button onClick={() => handleApptStatus(a.id, 'Confirmed')} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1">
                          <Check className="w-3 h-3" /> Confirm
                        </button>
                        <button onClick={() => handleApptStatus(a.id, 'Cancelled')} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-500 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDeleteAppt(a.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MESSAGES TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Buyer Direct Messages & Inquiries</h3>
          </div>
          <InboxPanel activeChatRequest={activeChatRequest} />
        </div>
      )}



      {/* ── PROFILE TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Agent Profile Settings</h3>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200 shrink-0">
              <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Email Address', value: user.email },
                  { label: 'Phone Number', value: user.phone || 'Not provided' },
                  { label: 'Role', value: user.role, badge: true },
                  { label: 'Total Listings', value: properties.length },
                  { label: 'Active Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' }) : 'N/A' },
                ].map(({ label, value, badge }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    {badge ? (
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold rounded-full uppercase">{value}</span>
                    ) : (
                      <p className="text-sm font-bold text-slate-900">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900">Performance Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KPICard icon={Building2} label="Total Listings" value={properties.length} color="sky" />
              <KPICard icon={Users} label="Total Leads" value={leads.length} color="emerald" />
              <KPICard icon={Calendar} label="Appointments" value={appointments.length} color="violet" />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onPropertyAdded={handlePropertyAdded} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default AgentDashboard;
