import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAgencies } from '../services/api';
import { Building2, Star, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

const AgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAgencies();
        if (res.data.success) setAgencies(res.data.agencies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Verified Real Estate Agencies</h1>
        <p className="text-sm text-slate-500 mt-1">Connect with Australia's premier real estate brokerages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agencies.map((agency) => (
          <div key={agency._id} className="glass-panel rounded-2xl overflow-hidden border border-slate-200 space-y-4 hover:border-sky-500/40 transition-colors flex flex-col justify-between">
            <div className="relative h-40 bg-white overflow-hidden">
              <img src={agency.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-500 text-slate-950 flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{agency.rating || 4.9}</span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <img src={agency.logo} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-300" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{agency.name}</h3>
                    <p className="text-[11px] text-sky-500 font-semibold">{agency.licenseNumber}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3">{agency.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{agency.address?.city}, {agency.address?.state}</span>
                </div>
                <Link
                  to={`/agencies/${agency._id}`}
                  className="block w-full text-center py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold hover:bg-sky-500 hover:text-slate-950 transition-colors"
                >
                  View Agency Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgenciesPage;
