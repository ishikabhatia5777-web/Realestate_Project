import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAgencyById } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Star, ShieldCheck, MapPin, Phone, Mail, User } from 'lucide-react';

const AgencyDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAgencyById(id);
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !data) {
    return <div className="py-20 text-center text-slate-400">Loading agency profile...</div>;
  }

  const { agency, agents, properties } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Profile Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img src={agency.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-contain bg-white p-2 border border-slate-700" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{agency.name}</h1>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-amber-400 font-semibold mt-1">Licence #{agency.licenseNumber}</p>
              <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{agency.address?.street}, {agency.address?.city} {agency.address?.state}</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-6 text-center">
            <div>
              <span className="text-2xl font-bold text-white block">⭐ {agency.rating || 4.9}</span>
              <span className="text-xs text-slate-400">Agency Rating</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">{properties.length}</span>
              <span className="text-xs text-slate-400">Active Listings</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
          {agency.description}
        </p>
      </div>

      {/* Agents Team */}
      {agents.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Agency Agents & Brokers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div key={agent._id} className="glass-panel p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                <img src={agent.avatar} alt={agent.name} className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-amber-500/40" />
                <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                <p className="text-[11px] text-amber-400 font-semibold uppercase">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Listings */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Active Agency Property Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <PropertyCard key={prop._id} property={prop} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default AgencyDetailPage;
