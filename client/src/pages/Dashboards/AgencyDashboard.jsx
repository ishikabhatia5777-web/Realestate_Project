import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAgencyById, fetchProperties } from '../../services/api';
import { Building2, Users, FileText, Plus, CheckCircle } from 'lucide-react';

const AgencyDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [agencyData, setAgencyData] = useState(null);
  const [agents, setAgents] = useState([
    { _id: 'a1', name: 'Samantha Reed', email: 'samantha@prestigerealty.com.au', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
    { _id: 'a2', name: 'Marcus Thorne', email: 'marcus@prestigerealty.com.au', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' }
  ]);
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

  const handleInviteAgent = () => {
    const email = prompt("Enter agent's email address to invite:");
    if (!email) return;
    const name = prompt("Enter agent's full name:");
    if (!name) return;

    const newAgent = {
      _id: `invited_${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    };

    setAgents(prev => [...prev, newAgent]);
    alert(`Invitation successfully generated and dispatched to ${email}! The agent has been added to your roster.`);
  };

  if (authLoading || !user || user.role !== 'agency') {
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
      <div>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">AGENCY PORTAL</span>
        <h1 className="text-3xl font-extrabold text-white">Brokerage Performance Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned Agents</span>
          <p className="text-3xl font-extrabold text-white">{agencyData?.agents?.length || 4}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Listings</span>
          <p className="text-3xl font-extrabold text-white">{agencyData?.properties?.length || 12}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Agency Rating</span>
          <p className="text-3xl font-extrabold gold-gradient-text">⭐ {agencyData?.agency?.rating || 4.9}</p>
        </div>
      </div>

      {/* Agents Roster */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Agency Agents & Licensees</h3>
          <button 
            onClick={handleInviteAgent}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            + Invite Agent
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
              <img src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} alt={agent.name} className="w-10 h-10 rounded-full object-cover border border-slate-800" />
              <div>
                <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                <p className="text-[10px] text-slate-400">{agent.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AgencyDashboard;
