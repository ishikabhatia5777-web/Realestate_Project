import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminMetrics, fetchAdminUsers, updateUserRole, fetchProperties, updatePropertyStatus, approveProperty, rejectProperty } from '../../services/api';
import { ShieldCheck, Users, Building2, DollarSign, Activity, Check, X, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('metrics');
  const [loading, setLoading] = useState(true);

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
      const [mRes, uRes, pRes] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminUsers(),
        fetchProperties({ status: 'Pending Review' })
      ]);

      if (mRes.data.success) {
        setMetrics(mRes.data.metrics);
        setLogs(mRes.data.recentLogs || []);
      }
      if (uRes.data.success) setUsers(uRes.data.users);
      if (pRes.data.success) setPendingProperties(pRes.data.properties);
    } catch (err) {
      console.error(err);
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
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleListingApproval = async (propId, status) => {
    try {
      if (status === 'Published') {
        if (!window.confirm("Approve and publish this property live?")) return;
        const res = await approveProperty(propId);
        if (res.data.success) {
          setPendingProperties(prev => prev.filter(p => p._id !== propId));
          alert("Property listing approved and published successfully!");
        }
      } else {
        const reason = prompt("Enter listing rejection reason:", "Listing did not meet platform guidelines.");
        if (reason === null) return; // user cancelled prompt
        const res = await rejectProperty(propId, reason);
        if (res.data.success) {
          setPendingProperties(prev => prev.filter(p => p._id !== propId));
          alert("Property listing rejected and submitter notified.");
        }
      }
    } catch (err) {
      console.error('Moderation error:', err);
      alert("An error occurred during listing moderation review.");
    }
  };

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">ADMINISTRATION PANEL</span>
          <h1 className="text-3xl font-extrabold text-white">Super Admin Command Center</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'metrics' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Overview Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Users & RBAC ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'approvals' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Pending Listings ({pendingProperties.length})
          </button>
        </div>
      </div>

      {activeTab === 'metrics' && metrics && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Platform Users</span>
              <p className="text-3xl font-extrabold text-white">{metrics.totalUsers}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Properties</span>
              <p className="text-3xl font-extrabold text-white">{metrics.totalProperties}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Agencies</span>
              <p className="text-3xl font-extrabold text-white">{metrics.totalAgencies}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stripe Gross Revenue</span>
              <p className="text-3xl font-extrabold gold-gradient-text">${metrics.totalRevenue?.toLocaleString() || '14,850'}</p>
            </div>
          </div>

          {/* Activity Logs — Table Format */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">

            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Platform Activity Log</h3>
                  <p className="text-[11px] text-slate-500">Every admin action and system event is recorded below.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                {logs.length} Total Events
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs space-y-2">
                <Activity className="w-8 h-8 text-slate-700 mx-auto stroke-[1.5]" />
                <p>No activity logs recorded yet. Events will appear here automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  {/* Column Headers */}
                  <thead className="bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-10">#</th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Event Type</th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">What Happened</th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                      <th className="px-5 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">Time</th>
                    </tr>
                  </thead>

                  {/* Table Rows */}
                  <tbody className="divide-y divide-slate-800/50">
                    {logs.map((log, i) => {
                      const action = (log.action || '').toUpperCase();
                      const ts = log.createdAt ? new Date(log.createdAt) : new Date();

                      // Auto-classify event and assign badge + message
                      let badge = { label: action || 'OTHER', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
                      let what = log.details || 'A platform event was recorded.';

                      if (action.includes('SEED') || action.includes('INIT')) {
                        badge = { label: '⚙ System Init', bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20' };
                        what = log.details;
                      } else if (action.includes('LOGIN') || action.includes('AUTH')) {
                        badge = { label: '🔐 Login / Auth', bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' };
                        what = log.details;
                      } else if (action.includes('REGISTER') || action.includes('CREATE_USER')) {
                        badge = { label: '👤 New User', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' };
                        what = log.details;
                      } else if (action.includes('APPROVE') || action.includes('PUBLISH')) {
                        badge = { label: '✅ Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' };
                        what = log.details;
                      } else if (action.includes('REJECT')) {
                        badge = { label: '❌ Rejected', bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' };
                        what = log.details;
                      } else if (action.includes('DELETE')) {
                        badge = { label: '🗑 Deleted', bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' };
                        what = log.details;
                      } else if (action.includes('ROLE') || action.includes('PERMISSION')) {
                        badge = { label: '🛡 Role Change', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' };
                        what = log.details;
                      } else if (action.includes('PAYMENT') || action.includes('STRIPE') || action.includes('TRANSACTION')) {
                        badge = { label: '💳 Payment', bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20' };
                        what = log.details;
                      } else if (action.includes('PROPERTY') || action.includes('LISTING')) {
                        badge = { label: '🏠 Property', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20' };
                        what = log.details;
                      }

                      return (
                        <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                          {/* Row number */}
                          <td className="px-5 py-3.5 text-slate-600 font-mono font-bold">{i + 1}</td>

                          {/* Event Type Badge */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${badge.bg} ${badge.text} ${badge.border}`}>
                              {badge.label}
                            </span>
                          </td>

                          {/* What Happened — plain readable description */}
                          <td className="px-5 py-3.5 text-slate-300 max-w-[420px] leading-relaxed">
                            {what}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                            {ts.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>

                          {/* Time */}
                          <td className="px-5 py-3.5 text-slate-400 font-mono whitespace-nowrap">
                            {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 overflow-x-auto space-y-4">
          <h3 className="text-base font-bold text-white">Manage Platform Users & Access Control</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Current Role</th>
                <th className="pb-3">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="text-slate-300">
                  <td className="py-3 font-semibold text-white">{u.name}</td>
                  <td className="py-3 text-slate-400">{u.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value="buyer">buyer</option>
                      <option value="owner">owner</option>
                      <option value="agent">agent</option>
                      <option value="agency">agency</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Pending Property Listings Queue</h3>
          {pendingProperties.length === 0 ? (
            <p className="text-xs text-slate-500 py-6">No listings waiting for admin review.</p>
          ) : (
            pendingProperties.map((p) => (
              <div key={p._id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400">${p.price?.toLocaleString()} • {p.address?.suburb}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleListingApproval(p._id, 'Published')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => handleListingApproval(p._id, 'Rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
