import React, { useEffect, useState } from 'react';
import { fetchAgents } from '../services/api';
import {
  Star, MapPin, Phone, Mail, ShieldCheck, Search,
  Briefcase, Award, Users, ChevronRight, Building2
} from 'lucide-react';

const SPECIALTY_COLORS = {
  'Luxury Homes': 'bg-sky-500/20 text-sky-500 border-sky-500/30',
  'Waterfront': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Investments': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'First Home Buyers': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Apartments': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Suburbs': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Off-the-Plan': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Inner-City': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Coastal': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'Holiday Homes': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Land': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'Family Homes': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'Western Suburbs': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Luxury': 'bg-sky-500/20 text-sky-500 border-sky-500/30',
  'Acreage': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Rural': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Wine Country': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const defaultColor = 'bg-slate-200/50 text-slate-600 border-slate-600/40';

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const decimal = rating - full;
  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? 'text-sky-500 fill-amber-400'
              : i === full && decimal >= 0.5
              ? 'text-sky-500 fill-amber-400/50'
              : 'text-slate-600'
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-bold text-sky-500">{rating.toFixed(1)}</span>
    </div>
  );
};

const AgentCard = ({ agent }) => {
  const specialties = agent.specialties || [];
  const agencyLabel = agent.agencyId?.name || agent.agencyName || null;

  return (
    <div className="glass-panel rounded-3xl border border-slate-200 hover:border-sky-500/50 transition-all duration-300 group flex flex-col bg-gradient-to-b from-slate-900/80 to-slate-950/80 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-amber-400 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 flex flex-col flex-1">
        {/* Header: Avatar + Name + Rating */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={agent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={agent.name}
              className="w-18 h-18 w-[72px] h-[72px] rounded-2xl object-cover border-2 border-slate-300 group-hover:border-sky-500/60 transition-all shadow-lg"
            />
            {/* Online badge */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow" title="Active" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-0.5">
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-500 transition-colors truncate">{agent.name}</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Verified Agent" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 mb-1.5">Licensed Real Estate Agent</p>
            <StarRating rating={agent.rating || 4.8} />
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1">
          {agent.bio || `${agent.name} is a dedicated real estate professional providing exceptional service and deep market insights to help clients buy, sell, and invest with confidence.`}
        </p>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.map((s) => (
              <span key={s} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SPECIALTY_COLORS[s] || defaultColor}`}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between py-3 border-y border-slate-200/80 mb-4 text-center">
          <div>
            <p className="text-sm font-extrabold text-slate-900">{agent.dealsCount || '—'}</p>
            <p className="text-[10px] text-slate-500 font-medium">Deals Closed</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <p className="text-sm font-extrabold text-slate-900">{agent.rating ? agent.rating.toFixed(1) : '—'}</p>
            <p className="text-[10px] text-slate-500 font-medium">Rating</p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <p className="text-sm font-extrabold text-slate-900 truncate max-w-[80px]">{agent.licenseNumber || '—'}</p>
            <p className="text-[10px] text-slate-500 font-medium">License</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2 mb-5">
          {agent.location || agent.address?.city ? (
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span>{agent.location || `${agent.address?.city}, ${agent.address?.state}`}</span>
            </div>
          ) : null}
          {agencyLabel && (
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="truncate">{agencyLabel}</span>
            </div>
          )}
          {agent.phone && (
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <Phone className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span>{agent.phone}</span>
            </div>
          )}
          {agent.email && (
            <div className="flex items-center space-x-2.5 text-xs text-slate-500 group/email">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="truncate">{agent.email}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={`mailto:${agent.email}`}
          className="block w-full text-center py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-500 text-xs font-bold hover:bg-sky-500 hover:text-slate-950 hover:border-sky-500 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Agent</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};

const FALLBACK_AGENTS = [
  {
    _id: 'fa-001',
    name: 'Ishika Bhatia',
    email: 'ishikabhatia51@gmail.com',
    phone: '+61 422 100 001',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    bio: 'Passionate real estate agent with a keen eye for premium properties. Dedicated to making every client\'s property journey smooth and rewarding.',
    licenseNumber: 'NSW-AG-10021',
    specialties: ['Luxury Homes', 'Apartments', 'Investments'],
    rating: 4.9,
    dealsCount: 64,
    location: 'Sydney, NSW',
    agencyName: 'Prestige Property Group'
  },
  {
    _id: 'fa-002',
    name: 'Upansh Verma',
    email: 'upansh769@gmail.com',
    phone: '+61 411 200 002',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    bio: 'Results-driven agent specialising in first-home buyers and suburban growth corridors. Trusted advisor with a transparent, client-first approach.',
    licenseNumber: 'ACT-AG-20025',
    specialties: ['First Home Buyers', 'Suburbs', 'Land'],
    rating: 4.7,
    dealsCount: 48,
    location: 'Canberra, ACT',
    agencyName: 'Horizon Real Estate Canberra'
  },
  {
    _id: 'fa-003',
    name: 'Reet Kapoor',
    email: 'reet67711@gmail.com',
    phone: '+61 433 300 003',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    bio: 'Melbourne specialist with expertise in off-the-plan developments and inner-city investments. Helping clients build wealth through smart property choices.',
    licenseNumber: 'VIC-AG-30036',
    specialties: ['Off-the-Plan', 'Inner-City', 'Investments'],
    rating: 4.8,
    dealsCount: 77,
    location: 'Melbourne, VIC',
    agencyName: 'Melbourne Elite Properties'
  },
  {
    _id: 'fa-004',
    name: 'Ruhi Bhatia',
    email: 'ruhibhatia0022@gmail.com',
    phone: '+61 455 400 004',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?auto=format&fit=crop&q=80&w=400',
    bio: 'Brisbane coastal living expert. Specialising in holiday homes and beachfront properties with a passion for matching families with their dream lifestyle.',
    licenseNumber: 'QLD-AG-40047',
    specialties: ['Coastal', 'Holiday Homes', 'Family Homes'],
    rating: 5.0,
    dealsCount: 91,
    location: 'Brisbane, QLD',
    agencyName: 'Brisbane Coastal Realty'
  },
  {
    _id: 'fa-005',
    name: 'Saghun Mehta',
    email: 'saghun8699@gmail.com',
    phone: '+61 499 500 005',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Perth luxury property specialist with a strong track record in premium Western suburb estates. Known for negotiating the best outcomes for clients.',
    licenseNumber: 'WA-AG-50058',
    specialties: ['Luxury', 'Western Suburbs', 'Acreage'],
    rating: 4.8,
    dealsCount: 53,
    location: 'Perth, WA',
    agencyName: 'Perth Premium Realty'
  }
];

const FindAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAgents();
        // Use API data if it returns agents, otherwise fall back to built-in list
        if (res.data.success && res.data.agents.length > 0) {
          setAgents(res.data.agents);
        } else {
          setAgents(FALLBACK_AGENTS);
        }
      } catch (err) {
        // API error — always show fallback agents so page is never blank
        console.warn('Agents API unavailable, using fallback data.');
        setAgents(FALLBACK_AGENTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Collect unique locations for filter chips
  const locations = ['All', ...new Set(agents.map(a => {
    if (a.location) return a.location.split(',').pop().trim();
    if (a.address?.state) return a.address.state;
    return null;
  }).filter(Boolean))];

  const filtered = agents.filter(agent => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      agent.name?.toLowerCase().includes(q) ||
      agent.bio?.toLowerCase().includes(q) ||
      agent.specialties?.some(s => s.toLowerCase().includes(q)) ||
      agent.location?.toLowerCase().includes(q) ||
      (agent.agencyId?.name || agent.agencyName || '').toLowerCase().includes(q);

    const matchLocation =
      locationFilter === 'All' ||
      agent.location?.includes(locationFilter) ||
      agent.address?.state === locationFilter;

    return matchSearch && matchLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg brand-gradient-bg flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-950" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">Verified Professionals</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Find Your Perfect Agent</h1>
        <p className="text-slate-500 text-sm max-w-xl">
          Browse Australia's top-rated real estate agents. Each agent is fully verified, licensed, and ready to help you buy, sell, or invest.
        </p>
      </div>


      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, specialty, location or agency..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {locations.map(loc => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                locationFilter === loc
                  ? 'bg-sky-500 text-slate-950 border-sky-500'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-sky-500/50 hover:text-sky-500'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-slate-500">
          Showing <span className="text-sky-500 font-bold">{filtered.length}</span> agent{filtered.length !== 1 ? 's' : ''}
          {search && <> matching "<span className="text-slate-900">{search}</span>"</>}
        </p>
      )}

      {/* Agent Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
                <div className="h-3 bg-slate-100 rounded w-4/6" />
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-900 font-bold">No agents found</p>
          <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
          <button onClick={() => { setSearch(''); setLocationFilter('All'); }} className="px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-500 text-xs font-bold hover:bg-sky-500/20 transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(agent => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindAgentsPage;
