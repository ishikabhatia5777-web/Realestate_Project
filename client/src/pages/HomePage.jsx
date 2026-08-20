import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import { fetchProperties, fetchAgencies, fetchAdminBlogs } from '../services/api';
import { Building2, Sparkles, Award, ArrowRight, ShieldCheck, TrendingUp, MapPin, DollarSign, Home, Search } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-redirect agents and admins to their dashboard if they try to view the homepage
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'agent') navigate('/dashboard/agent', { replace: true });
      else if (user.role === 'agency') navigate('/dashboard/agency', { replace: true });
      else if (user.role === 'admin' || user.role === 'super_admin') navigate('/dashboard/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [propRes, allPropRes, agencyRes, blogRes] = await Promise.all([
          fetchProperties({ limit: 6 }),
          fetchProperties({ limit: 100 }),
          fetchAgencies(),
          fetchAdminBlogs()
        ]);

        if (propRes.data && propRes.data.success) setFeaturedProperties(propRes.data.properties);
        if (allPropRes.data && allPropRes.data.success) setAllProperties(allPropRes.data.properties);
        if (agencyRes.data && agencyRes.data.success) setAgencies(agencyRes.data.agencies);
        if (blogRes.data && blogRes.data.success && blogRes.data.blogs && blogRes.data.blogs.length > 0) {
          setBlogs(blogRes.data.blogs);
        } else {
          setBlogs([
            {
              _id: 'fb-1',
              title: 'Australian Property Market Outlook 2026: Trends & Growth Suburbs',
              excerpt: 'An in-depth analysis of interest rate trajectory, suburb price performance, and key demographic shifts shaping 2026 luxury real estate.',
              category: 'Market Insights',
              readTime: '5 min read',
              image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'
            },
            {
              _id: 'fb-2',
              title: 'Top 5 Renovation Projects That Boost Property Valuation',
              excerpt: 'Discover which high-end home upgrades yield the highest ROI when preparing your premium residential listing for auction.',
              category: 'Sellers Guide',
              readTime: '4 min read',
              image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
            }
          ]);
        }
      } catch (err) {
        console.error('Failed loading home data', err);
        setBlogs([
          {
            _id: 'fb-1',
            title: 'Australian Property Market Outlook 2026: Trends & Growth Suburbs',
            excerpt: 'An in-depth analysis of interest rate trajectory, suburb price performance, and key demographic shifts shaping 2026 luxury real estate.',
            category: 'Market Insights',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'
          },
          {
            _id: 'fb-2',
            title: 'Top 5 Renovation Projects That Boost Property Valuation',
            excerpt: 'Discover which high-end home upgrades yield the highest ROI when preparing your premium residential listing for auction.',
            category: 'Sellers Guide',
            readTime: '4 min read',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      
      {/* Hero Banner */}
      <HeroSection />

      {/* Top Agencies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">TRUSTED PARTNERS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Premier Real Estate Agencies</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Partnered with Australia's most reputable brokerages delivering transparent transactions and unmatched expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {agencies.map((agency) => (
            <div key={agency._id} className="glass-panel p-6 rounded-2xl border border-slate-200 flex items-start space-x-5 hover:border-sky-500/40 transition-colors">
              <img
                src={agency.logo}
                alt={agency.name}
                className="w-20 h-20 rounded-xl object-contain bg-white p-2 border border-slate-300 flex-shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{agency.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/30">
                    ⭐ {agency.rating || 4.9}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{agency.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{agency.totalSales || 45} Sales Closed</span>
                  <Link to={`/agencies/${agency._id}`} className="font-bold text-sky-500 hover:text-amber-300">
                    View Portfolio →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suburb Explorer Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">DISCOVER</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Explore Top Suburbs</h2>
          </div>
          <Link to="/properties" className="text-sm font-bold text-sky-500 hover:text-amber-300">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Point Piper', state: 'NSW', median: '$18.5M', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=400' },
            { name: 'Toorak', state: 'VIC', median: '$5.9M', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400' },
            { name: 'Bondi Beach', state: 'NSW', median: '$4.8M', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400' },
            { name: 'Mosman', state: 'NSW', median: '$5.2M', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400' },
            { name: 'Noosa Heads', state: 'QLD', median: '$3.2M', img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=400' },
            { name: 'South Yarra', state: 'VIC', median: '$3.4M', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400' },
          ].map((suburb) => (
            <Link
              key={suburb.name}
              to={`/suburbs/${encodeURIComponent(suburb.name)}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 hover:border-sky-500/50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-sky-500/10"
            >
              <div className="aspect-square relative">
                <img src={suburb.img} alt={suburb.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-extrabold text-slate-900 leading-tight">{suburb.name}</p>
                <p className="text-[10px] text-sky-500 font-bold">{suburb.median} median</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Sold Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">RECENT RESULTS</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Recently Sold Properties</h2>
          </div>
          <Link to="/sold" className="text-sm font-bold text-sky-500 hover:text-amber-300">View All Sold →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Grand Harbourfront Villa', suburb: 'Point Piper NSW', price: '$22,400,000', date: '12 Jul 2026', beds: 6, baths: 7, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600' },
            { title: 'Toorak European Villa', suburb: 'Toorak VIC', price: '$16,500,000', date: '30 Jun 2026', beds: 5, baths: 6, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600' },
            { title: 'Vaucluse Cliffside Mansion', suburb: 'Vaucluse NSW', price: '$19,800,000', date: '15 Jun 2026', beds: 5, baths: 6, img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600' },
          ].map((sale, i) => (
            <Link to="/sold" key={i} className="group glass-panel rounded-2xl border border-slate-200 overflow-hidden hover:border-sky-500/40 transition-all hover:-translate-y-1 shadow-lg hover:shadow-sky-500/10">
              <div className="relative h-48 overflow-hidden">
                <img src={sale.img} alt={sale.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 text-slate-600 border border-slate-300 uppercase tracking-wider">SOLD</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-500 transition-colors">{sale.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-sky-500" />{sale.suburb}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-base font-extrabold text-slate-900">{sale.price}</span>
                  <span className="text-[11px] text-slate-500">{sale.date}</span>
                </div>
                <p className="text-[11px] text-slate-500">{sale.beds} bed • {sale.baths} bath</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Map Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 space-y-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">INTERACTIVE GEOSPATIAL MAP</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Explore All Properties by Geolocation & Radius</h3>
            <p className="text-xs text-slate-500 mt-1">Viewing all database properties on Google Maps with live prices and details.</p>
          </div>
          <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-200">
            <PropertyMap properties={allProperties.length > 0 ? allProperties : featuredProperties} />
          </div>
        </div>
      </section>

      {/* Find an Agent CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden glass-panel rounded-3xl border border-sky-500/20 p-10 md:p-16 text-center space-y-6">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-sky-500/30 bg-sky-500/10">
              <Search className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">CONNECT WITH EXPERTS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Find Your Perfect <span className="brand-gradient-text">Real Estate Agent</span></h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Our network of 1,250+ certified agents across Australia specialise in luxury residential, commercial, and development properties. Get matched with the right expert for your goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/agents" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/30">
                Find an Agent
              </Link>
              <Link to="/properties" className="px-8 py-3.5 rounded-xl border border-slate-600 text-slate-900 font-extrabold text-sm hover:border-sky-500 hover:text-sky-500 transition-colors">
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Insights / Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block">REPORTS & ANALYTICS</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Property Market Insights</h2>
          </div>
          <Link to="/blogs" className="text-sm font-bold text-sky-500 hover:text-amber-300">
            View All News →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <div key={blog._id} className="glass-panel rounded-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
              <img src={blog.image} alt={blog.title} className="w-full md:w-48 h-48 object-cover flex-shrink-0" />
              <div className="p-5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block mb-1">
                    {blog.category} • {blog.readTime}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">{blog.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{blog.excerpt}</p>
                </div>
                <Link to="/blogs" className="text-xs font-bold text-sky-500 hover:text-amber-300">
                  Read Full Article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
