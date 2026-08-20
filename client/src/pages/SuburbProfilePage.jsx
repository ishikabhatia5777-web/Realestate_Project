import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { TrendingUp, TrendingDown, MapPin, Home, DollarSign, Clock, ArrowLeft, Search } from 'lucide-react';

// Mock suburb stats data — would come from a real API in production
const SUBURB_STATS = {
  'Point Piper': { medianHouse: 18500000, medianUnit: 4200000, clearanceRate: 82, daysOnMarket: 41, growth: 12.4, trend: 'up', description: 'Point Piper is one of Sydney\'s most prestigious harbourside suburbs, consistently ranking among Australia\'s most expensive postcodes. Located on a peninsula between Double Bay and Darling Point, the suburb offers unrivalled Sydney Harbour views and direct waterfront access.' },
  'Barangaroo': { medianHouse: null, medianUnit: 2850000, clearanceRate: 78, daysOnMarket: 33, growth: 9.1, trend: 'up', description: 'Barangaroo is a world-class urban renewal precinct on Sydney Harbour\'s western edge. The area features luxury apartments, boutique retail, fine dining and seamless waterfront promenade access.' },
  'Bondi Beach': { medianHouse: 4800000, medianUnit: 1650000, clearanceRate: 74, daysOnMarket: 38, growth: 7.2, trend: 'up', description: 'Bondi Beach is one of Australia\'s most iconic coastal suburbs, famous for its golden beach, vibrant café culture, and eclectic mix of residents. Consistently among Sydney\'s most sought-after addresses.' },
  'Mosman': { medianHouse: 5200000, medianUnit: 1350000, clearanceRate: 76, daysOnMarket: 44, growth: 6.8, trend: 'up', description: 'Mosman is an affluent lower North Shore suburb renowned for its prestigious schools, leafy streets, and spectacular Middle Harbour and Sydney Harbour views.' },
  'South Yarra': { medianHouse: 3450000, medianUnit: 820000, clearanceRate: 71, daysOnMarket: 35, growth: 5.9, trend: 'up', description: 'South Yarra is Melbourne\'s premier inner-city suburb, known for luxury boutiques along Chapel Street and Toorak Road, fine dining, and a vibrant cosmopolitan lifestyle.' },
  'Toorak': { medianHouse: 5900000, medianUnit: 1200000, clearanceRate: 73, daysOnMarket: 52, growth: 4.2, trend: 'up', description: 'Toorak is Melbourne\'s most exclusive suburb, home to grand Victorian mansions, leafy avenues, and Australia\'s highest concentration of wealth per capita.' },
  'Noosa Heads': { medianHouse: 3200000, medianUnit: 1100000, clearanceRate: 68, daysOnMarket: 47, growth: 8.6, trend: 'up', description: 'Noosa Heads is a relaxed yet upscale coastal town on the Sunshine Coast, famed for Hastings Street boutiques, pristine national park beaches, and a renowned café and restaurant scene.' },
  'Manly': { medianHouse: 4100000, medianUnit: 1350000, clearanceRate: 72, daysOnMarket: 39, growth: 7.8, trend: 'up', description: 'Manly is a vibrant beachside suburb on Sydney\'s Northern Beaches, famous for its surf culture, ferry connections to the CBD, and relaxed coastal lifestyle.' },
  'default': { medianHouse: 1800000, medianUnit: 720000, clearanceRate: 65, daysOnMarket: 42, growth: 5.1, trend: 'up', description: 'A sought-after Australian suburb offering a compelling mix of lifestyle, investment potential, and community character.' }
};

const NEARBY_SCHOOLS = [
  { name: 'Ascham School', type: 'Private Girls', rating: 4.8, distance: '0.8 km' },
  { name: 'Cranbrook School', type: 'Private Boys', rating: 4.7, distance: '1.2 km' },
  { name: 'Sydney Grammar School', type: 'Private Co-ed', rating: 4.9, distance: '1.6 km' },
  { name: 'Woollahra Public School', type: 'Public Primary', rating: 4.2, distance: '0.9 km' },
];

const SuburbProfilePage = () => {
  const { suburbName } = useParams();
  const navigate = useNavigate();
  const suburb = decodeURIComponent(suburbName || '');
  const stats = SUBURB_STATS[suburb] || SUBURB_STATS['default'];

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProperties({ suburb, limit: 6 });
        if (res.data?.success) setProperties(res.data.properties);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (suburb) load();
  }, [suburb]);

  const fmt = (n) => n ? `$${(n / 1000000).toFixed(2)}M` : 'N/A';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Back */}
      <Link to="/properties" className="inline-flex items-center space-x-2 text-slate-500 hover:text-sky-500 transition-colors text-sm font-bold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Properties</span>
      </Link>

      {/* Hero Header */}
      <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-end">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative z-10 p-8">
            <div className="flex items-center space-x-2 text-sky-500 text-xs font-bold uppercase tracking-widest mb-2">
              <MapPin className="w-4 h-4" />
              <span>Suburb Profile</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">{suburb}</h1>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100/60 border-t border-slate-200">
          <div className="bg-white/80 p-5 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Median House Price</p>
            <p className="text-2xl font-extrabold text-slate-900">{fmt(stats.medianHouse)}</p>
          </div>
          <div className="bg-white/80 p-5 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Median Unit Price</p>
            <p className="text-2xl font-extrabold text-slate-900">{fmt(stats.medianUnit)}</p>
          </div>
          <div className="bg-white/80 p-5 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Clearance Rate</p>
            <div className="flex items-center justify-center space-x-1">
              <p className="text-2xl font-extrabold text-slate-900">{stats.clearanceRate}%</p>
              {stats.trend === 'up'
                ? <TrendingUp className="w-5 h-5 text-emerald-400" />
                : <TrendingDown className="w-5 h-5 text-rose-400" />}
            </div>
          </div>
          <div className="bg-white/80 p-5 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Avg. Days on Market</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.daysOnMarket}</p>
          </div>
        </div>
      </div>

      {/* Growth + Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xl font-bold text-slate-900">About {suburb}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{stats.description}</p>
          </div>

          {/* Price Growth Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Annual Price Growth</h2>
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stats.trend === 'up' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                {stats.trend === 'up'
                  ? <TrendingUp className="w-8 h-8 text-emerald-400" />
                  : <TrendingDown className="w-8 h-8 text-rose-400" />}
              </div>
              <div>
                <p className={`text-4xl font-extrabold ${stats.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.trend === 'up' ? '+' : '-'}{stats.growth}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Year-on-year capital growth (2025–2026)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Sidebar */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Nearby Schools</h2>
          <div className="space-y-3">
            {NEARBY_SCHOOLS.map((school, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-white border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4 text-sky-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{school.name}</p>
                  <p className="text-[11px] text-slate-500">{school.type} • {school.distance}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <div key={s} className={`w-2 h-2 rounded-full ${s <= Math.round(school.rating) ? 'bg-sky-400' : 'bg-slate-200'}`} />
                    ))}
                    <span className="text-[10px] text-slate-500 ml-1">{school.rating}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/properties?suburb=${suburb}&listingType=Sale`)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Properties for Sale in {suburb}</span>
        </button>
        <button
          onClick={() => navigate(`/properties?suburb=${suburb}&listingType=Rent`)}
          className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:border-sky-500 transition-colors flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Rentals in {suburb}</span>
        </button>
        <button
          onClick={() => navigate(`/sold?suburb=${suburb}`)}
          className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:border-sky-500 transition-colors flex items-center space-x-2"
        >
          <DollarSign className="w-4 h-4" />
          <span>Sold in {suburb}</span>
        </button>
      </div>

      {/* Properties for Sale */}
      <div className="space-y-6 border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Properties for Sale in {suburb}</h2>
          <Link to={`/properties?suburb=${suburb}&listingType=Sale`} className="text-sm font-bold text-sky-500 hover:text-amber-300">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-80 glass-panel rounded-2xl animate-pulse border border-slate-200" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-semibold">No active listings currently in {suburb}.</p>
            <Link to="/properties" className="mt-4 inline-block px-5 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
              Explore All Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </div>

    </div>
  );
};

export default SuburbProfilePage;
