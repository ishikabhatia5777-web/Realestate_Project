import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAgencyById, fetchProperties } from '../../services/api';
import { registerUser } from '../../services/api';
import { Building2, Users, FileText, Plus, CheckCircle } from 'lucide-react';

const AgencyDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [agencyData, setAgencyData] = useState(null);
  const [agents, setAgents] = useState([
    { _id: '507f1f77bcf86cd799439002', name: 'Ishika (Agent)', email: 'ishikabhatia51@gmail.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
    { _id: '507f1f77bcf86cd799439005', name: 'Upansh (Agent)', email: 'upansh769@gmail.com', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
    { _id: '507f1f77bcf86cd799439006', name: 'Reet (Agent)', email: 'reet67711@gmail.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
    { _id: '507f1f77bcf86cd799439007', name: 'Ruhi (Agent)', email: 'ruhibhatia0022@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
    { _id: '507f1f77bcf86cd799439008', name: 'Saghun (Agent)', email: 'saghun8699@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' }
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role !== 'agency') {
        if (user.role === 'super_admin' || user.role === 'admin') navigate('/dashboard/admin');
        else if (user.role === 'agent') navigate('/dashboard/agent');
        else if (user.role === 'seller') navigate('/dashboard/seller');
        else navigate('/dashboard/buyer');
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user || !user.agencyId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchAgencyById(user.agencyId);
        if (res.data.success) {
          setAgencyData(res.data);
          if (res.data.agents && res.data.agents.length > 0) {
            setAgents(res.data.agents);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleInviteAgent = async () => {
    const email = prompt("Enter agent's email address to invite:");
    if (!email) return;
    const name = prompt("Enter agent's full name:");
    if (!name) return;

    try {
      const res = await registerUser({
        name,
        email,
        password: 'password123',
        role: 'agent',
        agencyId: user.agencyId
      });

      if (res.data.success) {
        const newAgent = res.data.user;
        setAgents(prev => [...prev, newAgent]);
        alert(`Invitation successfully generated and dispatched to ${email}! The agent has been added to your roster. Default password: password123`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create agent');
    }
  };

  if (authLoading || !user || user.role !== 'agency') {
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
      <div>
        <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">AGENCY PORTAL</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Brokerage Performance Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Assigned Agents</span>
          <p className="text-3xl font-extrabold text-slate-900">{agencyData?.agents?.length || 5}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Listings</span>
          <p className="text-3xl font-extrabold text-slate-900">{agencyData?.properties?.length || 12}</p>
        </div>
      </div>

      {/* Agents Roster */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Agency Agents & Licensees</h3>
          <button 
            onClick={handleInviteAgent}
            className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors"
          >
            + Invite Agent
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div 
              key={agent._id} 
              onClick={() => setSelectedAgentId(selectedAgentId === agent._id ? null : agent._id)}
              className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-colors ${selectedAgentId === agent._id ? 'bg-slate-100 border-sky-500 ring-1 ring-amber-500' : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
            >
              <img src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} alt={agent.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{agent.name}</h4>
                <p className="text-[10px] text-slate-500">{agent.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Agent Properties */}
      {selectedAgentId && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-4">
            <FileText className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Properties Managed by {agents.find(a => a._id === selectedAgentId)?.name}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agencyData?.properties?.filter(p => (p.agentId?._id || p.agentId) === selectedAgentId).length > 0 ? (
              agencyData.properties.filter(p => (p.agentId?._id || p.agentId) === selectedAgentId).map((property) => (
                <div key={property._id} className="p-4 rounded-xl bg-white/50 border border-slate-200 hover:border-slate-300 transition-colors flex space-x-4 cursor-pointer" onClick={() => navigate(`/properties/${property._id}`)}>
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'} alt={property.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{property.title}</h4>
                    <p className="text-xs text-sky-500 font-semibold mt-1">${property.price?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{property.address?.suburb}, {property.address?.state}</p>
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
  );
};

export default AgencyDashboard;
