import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminMetrics,
  fetchAdminUsers,
  updateUserRole,
  fetchProperties,
  approveProperty,
  rejectProperty,
  fetchAdminProperties,
  fetchOffers,
  fetchBookings,
  fetchAdminInquiries,
  uploadPropertiesCsv
} from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import {
  ShieldCheck, Users, Building2, DollarSign, Activity, Check, X, FileText,
  BarChart2, MessageSquare, Bell, Search, Filter, ArrowUpRight,
  ArrowDownRight, RefreshCw, Eye, Clock, Calendar, Briefcase, Plus, UserPlus, UploadCloud,
  Download, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'metrics';
  const activeTab = ['metrics', 'properties', 'users', 'agents', 'leads', 'inquiries', 'appointments'].includes(tabFromUrl) ? tabFromUrl : 'metrics';

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const [allUsers, setAllUsers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allInquiries, setAllInquiries] = useState([]);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvResult, setCsvResult] = useState(null); // { imported, failed, errors[] }
  const [showCsvModal, setShowCsvModal] = useState(false);
  const csvInputRef = useRef(null);
  const csvInputRef2 = useRef(null);

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'admin' && user.role !== 'super_admin') {
        if (user.role === 'agency') navigate('/dashboard/agency');
        else if (user.role === 'agent') navigate('/dashboard/agent');
        else if (user.role === 'seller') navigate('/dashboard/seller');
        else navigate('/dashboard/buyer');
      }
    }
  }, [user, authLoading, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes, pRes, allPropRes, offersRes, bookingsRes, inqRes] = await Promise.all([
        fetchAdminMetrics().catch(() => ({ data: { success: false } })),
        fetchAdminUsers().catch(() => ({ data: { success: false } })),
        fetchProperties({ status: 'Pending Review' }).catch(() => ({ data: { success: false } })),
        fetchAdminProperties().catch(() => ({ data: { success: false } })),
        fetchOffers().catch(() => ({ data: { success: false, offers: [] } })),
        fetchBookings().catch(() => ({ data: { success: false, bookings: [] } })),
        fetchAdminInquiries().catch(() => ({ data: { success: false, inquiries: [] } }))
      ]);

      if (mRes.data?.success) {
        setMetrics(mRes.data.metrics);
        setCharts(mRes.data.charts);
        setLogs(mRes.data.recentLogs || []);
      }
      if (uRes.data?.success) setAllUsers(uRes.data.users || []);
      if (pRes.data?.success) setPendingProperties(pRes.data.properties || []);
      if (allPropRes.data?.success) setAllProperties(allPropRes.data.properties || []);
      
      if (offersRes.data?.success) setAllOffers(offersRes.data.offers || []);
      if (bookingsRes.data?.success) setAllBookings(bookingsRes.data.bookings || []);
      if (inqRes.data?.success) setAllInquiries(inqRes.data.inquiries || []);
      
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.data.success) {
        setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingCsv(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await uploadPropertiesCsv(formData);
      if (res.data?.success) {
        setCsvResult({
          success: true,
          imported: res.data.imported,
          failed: res.data.failed,
          errors: res.data.errors || []
        });
        setShowCsvModal(true);
        loadAdminData(); // Refresh the list
      } else {
        setCsvResult({
          success: false,
          imported: 0,
          failed: 0,
          errors: [res.data?.message || 'Unknown server error']
        });
        setShowCsvModal(true);
      }
    } catch (error) {
      console.error('CSV Upload Error:', error);
      setCsvResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [error?.response?.data?.message || 'A network error occurred during upload.']
      });
      setShowCsvModal(true);
    } finally {
      setUploadingCsv(false);
      if (csvInputRef.current) csvInputRef.current.value = null;
      if (csvInputRef2.current) csvInputRef2.current.value = null;
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'title', 'description', 'propertyType', 'listingType', 'price',
      'street', 'suburb', 'city', 'state', 'postcode', 'country',
      'bedrooms', 'bathrooms', 'parkingSpaces', 'landArea', 'status'
    ];
    const sampleRow = [
      'Luxury Beachfront Villa', 'Stunning 5-bed property with ocean views.', 'Villa', 'Sale', '1850000',
      '12 Ocean Drive', 'Bondi Beach', 'Sydney', 'NSW', '2026', 'Australia',
      '5', '3', '2', '650', 'Published'
    ];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleListingApproval = async (propId, status) => {
    try {
      if (status === 'Published') {
        if (!window.confirm("Approve and publish this property live?")) return;
        const res = await approveProperty(propId);
        if (res.data.success) {
          setPendingProperties(prev => prev.filter(p => p._id !== propId));
          setAllProperties(prev => prev.map(p => p._id === propId ? { ...p, status: 'Published' } : p));
        }
      } else {
        const reason = prompt("Enter listing rejection reason:", "Listing did not meet platform guidelines.");
        if (reason === null) return;
        const res = await rejectProperty(propId, reason);
        if (res.data.success) {
          setPendingProperties(prev => prev.filter(p => p._id !== propId));
          setAllProperties(prev => prev.map(p => p._id === propId ? { ...p, status: 'Rejected' } : p));
        }
      }
    } catch (err) {
      console.error('Moderation error:', err);
      alert("An error occurred during listing moderation review.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-500">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const agents = allUsers.filter(u => u.role === 'agent' || u.role === 'agency');
  const filteredUsers = allUsers.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredProperties = allProperties.filter(p => p.title?.toLowerCase().includes(propSearch.toLowerCase()) || p.address?.city?.toLowerCase().includes(propSearch.toLowerCase()));

  return (
    <div className="bg-slate-50 min-h-screen pb-20">

      {/* CSV Result Modal */}
      {showCsvModal && csvResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className={`px-6 py-5 flex items-center gap-3 ${csvResult.success && csvResult.imported > 0 ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-rose-50 border-b border-rose-100'}`}>
              {csvResult.success && csvResult.imported > 0 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
              )}
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  {csvResult.success && csvResult.imported > 0 ? 'CSV Import Complete' : 'CSV Import Failed'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {csvResult.success && csvResult.imported > 0
                    ? `Successfully processed your property CSV file.`
                    : 'There was a problem importing the CSV.'}
                </p>
              </div>
              <button onClick={() => setShowCsvModal(false)} className="ml-auto p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">{csvResult.imported}</p>
                  <p className="text-xs text-emerald-700 font-semibold mt-1">Properties Imported</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-rose-600">{csvResult.failed}</p>
                  <p className="text-xs text-rose-700 font-semibold mt-1">Rows Failed</p>
                </div>
              </div>

              {/* Errors */}
              {csvResult.errors && csvResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Error Details
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
                    {csvResult.errors.map((err, i) => (
                      <p key={i} className="text-[11px] text-rose-600 font-mono">• {err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={handleDownloadTemplate} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                <Download className="w-3.5 h-3.5" /> Download Template
              </button>
              <button onClick={() => setShowCsvModal(false)} className="px-5 py-2 text-xs font-bold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-sky-500" />
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-1">Manage the platform, users, properties, and analytics.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                title="Download CSV template with correct column headers"
              >
                <Download className="w-4 h-4" /> CSV Template
              </button>
              <div className="relative">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleCsvUpload}
                  disabled={uploadingCsv}
                  title="Upload CSV"
                />
                <button
                  disabled={uploadingCsv}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 w-full justify-center disabled:opacity-50"
                >
                  {uploadingCsv ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" /> Upload Properties CSV</>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'metrics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <KpiCard title="Total Revenue" value={`$${(metrics?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} trend="+12.5%" trendUp={true} color="emerald" />
              <KpiCard title="Total Users" value={metrics?.totalUsers || 0} icon={Users} trend="+8.2%" trendUp={true} color="blue" />
              <KpiCard title="Total Properties" value={metrics?.totalProperties || 0} icon={Building2} trend="+4.3%" trendUp={true} color="indigo" />

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-slate-900">Revenue Overview</h3>
                  <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 text-slate-600 outline-none">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts?.revenueData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-extrabold text-slate-900">User Growth</h3>
                  <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 text-slate-600 outline-none">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts?.userGrowthData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="users" name="Total Users" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="agents" name="Agents" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-200 lg:col-span-1 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => navigate('/dashboard/admin?tab=properties')} className="w-full bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 p-3 rounded-xl flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">Manage Properties</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button onClick={() => navigate('/dashboard/admin?tab=agents')} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 p-3 rounded-xl flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">Manage Agents</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </button>
                  <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 p-3 rounded-xl flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">Payouts</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </button>
                </div>
              </div>

              <div className="glass-panel p-0 rounded-2xl border border-slate-200 lg:col-span-2 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-900">Recent Platform Activity</h3>
                  <button className="text-xs text-sky-500 font-bold hover:underline">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-80">
                  {logs.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">No activity logs recorded.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {logs.map((log, i) => (
                        <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                          <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-900">{log.details || log.action}</p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search properties by title or city..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filter Status
                </button>
                <div className="relative">
                  <input
                    ref={csvInputRef2}
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleCsvUpload}
                    disabled={uploadingCsv}
                    title="Upload CSV"
                  />
                  <button disabled={uploadingCsv} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 w-full justify-center disabled:opacity-50">
                    {uploadingCsv ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                    ) : (
                      <><UploadCloud className="w-4 h-4" /> Upload CSV</>
                    )}
                  </button>
                </div>
                <button className="px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors">
                  Add Property
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Property</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Price</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Agent</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProperties.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No properties found.</td></tr>
                    ) : filteredProperties.map(p => (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                              {p.images && p.images[0] ? (
                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                              ) : <Building2 className="w-5 h-5 text-slate-400 m-2.5" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.title}</p>
                              <p className="text-slate-500 text-[10px] truncate max-w-[200px]">{p.address?.city}, {p.address?.state}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          ${p.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            p.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {p.status || 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {p.agentId?.name || p.ownerId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {p.status === 'Pending Review' && (
                              <>
                                <button onClick={() => handleListingApproval(p._id, 'Published')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Approve">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleListingApproval(p._id, 'Rejected')} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100" title="Reject">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="p-1.5 bg-slate-50 text-slate-600 rounded hover:bg-slate-100" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'agents') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Registered</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeTab === 'agents' ? agents : filteredUsers).length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No records found.</td></tr>
                    ) : (activeTab === 'agents' ? agents : filteredUsers).map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-slate-500 text-[10px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize ${
                            u.role === 'admin' || u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'agent' || u.role === 'agency' ? 'bg-sky-100 text-sky-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1.5 text-slate-700 outline-none w-28"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === user._id}
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="agent">Agent</option>
                            <option value="agency">Agency</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">All Offers & Leads</h2>
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Property</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Buyer</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Offer Amount</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allOffers.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No leads or offers found.</td></tr>
                    ) : allOffers.map(o => (
                      <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {o.propertyId?.title || 'Unknown Property'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold">{o.buyerId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500">{o.buyerId?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          ${(o.offerAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {o.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Contact Requests & Inquiries</h2>
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Sender</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allInquiries.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No inquiries found.</td></tr>
                    ) : allInquiries.map(i => (
                      <tr key={i._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{i.buyerName || 'Anonymous'}</p>
                          <p className="text-[10px] text-slate-500">{i.buyerEmail || 'No email provided'}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]" title={i.buyerMessage || 'Contact Request'}>
                          {i.buyerMessage || 'Expert Connection Request'}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{i.createdAt ? new Date(i.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            i.status === 'closed' ? 'bg-emerald-100 text-emerald-700' :
                            i.status === 'contacted' ? 'bg-sky-100 text-sky-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {i.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900">Platform Bookings & Appointments</h2>
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Property</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Client</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Date / Time</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allBookings.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No appointments scheduled.</td></tr>
                    ) : allBookings.map(b => (
                      <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 truncate max-w-[200px]">
                          {b.propertyId?.title || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          {b.userId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}</p>
                          <p className="text-[10px] text-slate-500">{b.timeSlot || 'Any time'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {b.type || 'In-Person'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            b.status === 'Confirmed' ? 'bg-sky-100 text-sky-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, trend, trendUp, color }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20'
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-2">{value}</h4>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
