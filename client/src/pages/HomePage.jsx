import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import PropertyCard from '../components/PropertyCard';
import PropertyMap from '../components/PropertyMap';
import { fetchProperties, fetchAgencies, fetchAdminBlogs } from '../services/api';
import { Building2, Sparkles, Award, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-20 pb-20">
      
      {/* Hero Banner */}
      <HeroSection />

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>HANDPICKED EXCLUSIVES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Luxury Listings
            </h2>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center space-x-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 glass-panel rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Map Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">INTERACTIVE GEOSPATIAL MAP</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">Explore All Properties by Geolocation & Radius</h3>
            <p className="text-xs text-slate-400 mt-1">Viewing all database properties on Google Maps with live prices and details.</p>
          </div>
          <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-800">
            <PropertyMap properties={allProperties.length > 0 ? allProperties : featuredProperties} />
          </div>
        </div>
      </section>

      {/* Top Agencies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">TRUSTED PARTNERS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Premier Real Estate Agencies</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Partnered with Australia's most reputable brokerages delivering transparent transactions and unmatched expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {agencies.map((agency) => (
            <div key={agency._id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-start space-x-5 hover:border-amber-500/40 transition-colors">
              <img
                src={agency.logo}
                alt={agency.name}
                className="w-20 h-20 rounded-xl object-contain bg-white p-2 border border-slate-700 flex-shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{agency.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    ⭐ {agency.rating || 4.9}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{agency.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{agency.totalSales || 45} Sales Closed</span>
                  <Link to={`/agencies/${agency._id}`} className="font-bold text-amber-400 hover:text-amber-300">
                    View Portfolio →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Insights / Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">REPORTS & ANALYTICS</span>
            <h2 className="text-3xl font-extrabold text-white">Property Market Insights</h2>
          </div>
          <Link to="/blogs" className="text-sm font-bold text-amber-400 hover:text-amber-300">
            View All News →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <div key={blog._id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col md:flex-row">
              <img src={blog.image} alt={blog.title} className="w-full md:w-48 h-48 object-cover flex-shrink-0" />
              <div className="p-5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    {blog.category} • {blog.readTime}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-2">{blog.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{blog.excerpt}</p>
                </div>
                <Link to="/blogs" className="text-xs font-bold text-amber-400 hover:text-amber-300">
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
