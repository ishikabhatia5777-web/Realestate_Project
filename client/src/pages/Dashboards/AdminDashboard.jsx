import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminMetrics, fetchAdminUsers, updateUserRole, fetchProperties, updatePropertyStatus, approveProperty, rejectProperty, fetchAdminProperties } from '../../services/api';
import { ShieldCheck, Users, Building2, DollarSign, Activity, Check, X, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adminProperties, setAdminProperties] = useState([]);
  const [selectedAdminAgentId, setSelectedAdminAgentId] = useState(null);
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
      const [mRes, uRes, pRes, allPropRes] = await Promise.all([
        fetchAdminMetrics(),
        fetchAdminUsers(),
        fetchProperties({ status: 'Pending Review' }),
        fetchAdminProperties()
      ]);

      if (mRes.data.success) {
        setMetrics(mRes.data.metrics);
        setLogs(mRes.data.recentLogs || []);
      }
      if (uRes.data.success) setUsers(uRes.data.users);
      if (pRes.data.success) setPendingProperties(pRes.data.properties);
      if (allPropRes.data.success) setAdminProperties(allPropRes.data.properties);
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
          <h1 className="text-3xl font-extrabold text-white">Administrator Panel</h1>
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
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'agents' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Agents ({users.filter(u => u.role === 'agent').length})
          </button>
        </div>
      </div>

      {activeTab === 'metrics' && metrics && (
        <div className="space-y-8">

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
                      } else if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('AUTH')) {
                        badge = { label: '🔐 Login / Logout', bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' };
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
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/70">
            <h3 className="text-base font-extrabold text-white">Manage Platform Users & Access Control</h3>
            <p className="text-[11px] text-slate-500 mt-1">Assign roles and verify platform participants.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Current Role</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((u) => {
                  let roleBadge = { bg: 'bg-slate-800', text: 'text-slate-300' };
                  if (u.role === 'admin' || u.role === 'super_admin') roleBadge = { bg: 'bg-indigo-500/10', text: 'text-indigo-400' };
                  if (u.role === 'agent' || u.role === 'agency') roleBadge = { bg: 'bg-amber-500/10', text: 'text-amber-400' };
                  if (u.role === 'owner') roleBadge = { bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
                  if (u.role === 'buyer') roleBadge = { bg: 'bg-blue-500/10', text: 'text-blue-400' };

                  return (
                    <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} alt={u.name} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                          <span className="font-bold text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded border border-current opacity-80 ${roleBadge.bg} ${roleBadge.text} font-bold uppercase tracking-wider text-[10px]`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white hover:border-amber-500 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer w-32"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="owner">Owner</option>
                          <option value="agent">Agent</option>
                          <option value="agency">Agency</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Platform Agents & Licensees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users.filter(u => u.role === 'agent').map((agent) => (
                <div 
                  key={agent._id} 
                  onClick={() => setSelectedAdminAgentId(selectedAdminAgentId === agent._id ? null : agent._id)}
                  className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-colors ${selectedAdminAgentId === agent._id ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'}`}
                >
                  <img src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} alt={agent.name} className="w-10 h-10 rounded-full object-cover border border-slate-800" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                    <p className="text-[10px] text-slate-400">{agent.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedAdminAgentId && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">
                  Properties Managed by {users.find(u => u._id === selectedAdminAgentId)?.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminProperties.filter(p => (p.agentId?._id || p.agentId) === selectedAdminAgentId).length > 0 ? (
                  adminProperties.filter(p => (p.agentId?._id || p.agentId) === selectedAdminAgentId).map((property) => (
                    <div key={property._id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors flex space-x-4 cursor-pointer" onClick={() => navigate(`/properties/${property._id}`)}>
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} alt={property.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{property.title}</h4>
                        <p className="text-xs text-amber-400 font-semibold mt-1">${property.price?.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{property.address?.suburb}, {property.address?.state}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                    No active properties are currently assigned to this agent.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
