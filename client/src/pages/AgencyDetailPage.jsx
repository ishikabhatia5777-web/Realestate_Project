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
    return <div className="py-20 text-center text-slate-500">Loading agency profile...</div>;
  }

  const { agency, agents, properties } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Profile Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img src={agency.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-contain bg-white p-2 border border-slate-300" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{agency.name}</h1>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-sky-500 font-semibold mt-1">Licence #{agency.licenseNumber}</p>
              <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{agency.address?.street}, {agency.address?.city} {agency.address?.state}</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-6 text-center">
            <div>
              <span className="text-2xl font-bold text-slate-900 block">⭐ {agency.rating || 4.9}</span>
              <span className="text-xs text-slate-500">Agency Rating</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 block">{properties.length}</span>
              <span className="text-xs text-slate-500">Active Listings</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-4">
          {agency.description}
        </p>
      </div>

      {/* Agents Team */}
      {agents.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Agency Agents & Brokers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div key={agent._id} className="glass-panel p-6 rounded-3xl border border-slate-200 hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-between bg-gradient-to-b from-slate-900/80 to-slate-950/80 hover:shadow-lg hover:shadow-sky-500/10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} alt={agent.name} className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 group-hover:scale-105 transition-transform shadow-md shadow-sky-500/20" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Active"></div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-sky-500 transition-colors truncate">{agent.name}</h4>
                    <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest">{agent.role}</p>
                    {agent.licenseNumber && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Licence #{agent.licenseNumber}</p>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {agent.bio || `${agent.name} is a dedicated ${agent.role} providing exceptional real estate services and deep market insights to help you find your dream property.`}
                </p>
                
                <div className="pt-4 border-t border-slate-200/80 space-y-2.5 mt-auto">
                  <div className="flex items-center space-x-3 text-xs text-slate-600 group/item">
                    <div className="p-1.5 rounded-md bg-slate-100/80 group-hover/item:bg-sky-500/20 group-hover/item:text-sky-500 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{agent.email || 'Contact for email'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 group/item">
                    <div className="p-1.5 rounded-md bg-slate-100/80 group-hover/item:bg-sky-500/20 group-hover/item:text-sky-500 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>{agent.phone || 'Contact for phone'}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <a href={`mailto:${agent.email}`} className="block text-center w-full py-2.5 rounded-xl bg-slate-100/80 border border-slate-300 text-slate-900 text-xs font-bold hover:bg-sky-500 hover:text-slate-950 hover:border-sky-500 transition-all shadow-sm">
                    Contact Agent
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Listings */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Active Agency Property Portfolio</h2>
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
