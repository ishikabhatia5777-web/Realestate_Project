import React, { useEffect, useState } from 'react';
import { fetchAdminBlogs } from '../services/api';
import { 
  BookOpen, Sparkles, TrendingUp, Search, Calendar, User, 
  Clock, ArrowRight, X, BarChart3, ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Market Insights',
  'Sellers Guide',
  'Investment Analysis',
  'Architecture & Design',
  'Legal & Tax',
  'Luxury Suburbs'
];

const CURATED_REAL_ESTATE_ARTICLES = [
  {
    _id: 're-1',
    title: 'Australian Property Market Outlook 2026: Trends & Growth Suburbs',
    excerpt: 'An in-depth analysis of interest rate trajectory, suburb price performance, and key demographic shifts shaping 2026 luxury real estate.',
    content: 'The Australian housing market has shown resilient performance entering 2026 with strong demand driven by low inventory levels and high international migration. Prime waterfront precincts across Sydney, Melbourne, and South-East Queensland continue to lead price appreciation. Capital growth has accelerated in coastal corridors as high-net-worth buyers prioritize lifestyle amenities, eco-efficiency, and smart home technology.',
    category: 'Market Insights',
    author: 'Chief Economist Editorial',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min read',
    createdAt: '2026-08-01T10:00:00.000Z',
    featured: true
  },
  {
    _id: 're-2',
    title: 'Top 5 Renovation Projects That Boost Property Valuation',
    excerpt: 'Discover which high-end home upgrades yield the highest ROI when preparing your premium residential listing for auction.',
    content: 'When preparing to sell a luxury residence, strategic renovations dramatically increase buyer competition and push auction bids higher. Open-plan kitchen modernizations with stone waterfall islands, architectural landscape lighting, smart home automation, and energy-efficient solar plus storage systems lead the market in return on investment.',
    category: 'Sellers Guide',
    author: 'Design & Living Team',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read',
    createdAt: '2026-08-02T12:30:00.000Z'
  },
  {
    _id: 're-3',
    title: 'Why Commercial Real Estate is Rebounding in Q3 2026',
    excerpt: 'Institutional investors are returning to prime CBD office towers and boutique retail hubs across Sydney and Melbourne.',
    content: 'Commercial property investments are undergoing a structural resurgence as premium office spaces pivot toward high-amenity workplace experiences. Flexible executive suites, wellness spaces, and ESG-compliant green building designs are commanding premium rental yields.',
    category: 'Investment Analysis',
    author: 'Financial Advisory Hub',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    readTime: '6 min read',
    createdAt: '2026-08-03T09:15:00.000Z'
  },
  {
    _id: 're-4',
    title: 'Architectural Trends: Biophilic Luxury & Sustainable Penthouses',
    excerpt: 'How leading Australian architects are blending native greenery, cross-ventilation, and subterranean wellness spaces in ultra-luxury builds.',
    content: 'Biophilic design has evolved from a niche preference into an essential element of modern luxury architecture. Multi-million dollar penthouses and waterfront villas are incorporating living green walls, natural timber acoustics, thermal massing, and private rainwater reclamation systems.',
    category: 'Architecture & Design',
    author: 'Architectural Digest Syndicate',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
    readTime: '7 min read',
    createdAt: '2026-08-03T14:45:00.000Z'
  },
  {
    _id: 're-5',
    title: 'Navigating Property Tax Changes & Foreign Buyer Regulations',
    excerpt: 'Essential updates on stamp duty concessions, land tax thresholds, and compliance for domestic and overseas investors.',
    content: 'Navigating real estate taxation requires staying updated with federal and state regulatory amendments. Recent changes to land tax brackets and foreign investment review board guidelines impact high-value acquisitions. Consulting with experienced property conveyancers and wealth advisors ensures structured asset protection.',
    category: 'Legal & Tax',
    author: 'Aura Advisory Legal Counsel',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min read',
    createdAt: '2026-08-04T08:00:00.000Z'
  },
  {
    _id: 're-6',
    title: 'Suburb Spotlight: Point Piper & Barangaroo Market Dynamics',
    excerpt: 'Why Sydney Harbour precincts are setting record-breaking median price benchmarks in 2026.',
    content: 'Harbourside precincts like Point Piper and Barangaroo continue to break national price records. Driven by limited supply, private deep-water berths, and unhindered Opera House views, buyer demand remains exceptionally competitive. Exclusive off-market transactions account for over 40% of luxury transactions.',
    category: 'Luxury Suburbs',
    author: 'Prestige Realty Analysts',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min read',
    createdAt: '2026-08-04T09:30:00.000Z'
  }
];

const REAL_ESTATE_KEYWORDS = [
  'estate', 'property', 'properties', 'housing', 'house', 'home',
  'villa', 'apartment', 'penthouse', 'suburb', 'mortgage', 'realty',
  'realtor', 'rent', 'rental', 'lease', 'architecture', 'land',
  'auction', 'valuation', 'building', 'commercial', 'residential',
  'buyer', 'seller', 'investment', 'homeowner', 'broker'
];

const isRealEstateRelevant = (item) => {
  const text = `${item.title || ''} ${item.excerpt || ''} ${item.content || ''} ${item.category || ''}`.toLowerCase();
  return REAL_ESTATE_KEYWORDS.some(kw => text.includes(kw));
};

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBlogModal, setActiveBlogModal] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        let liveArticles = [];
        const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_b5f2690c23094572bbd5965869d92eeb';

        // Fetch Live Property & Real Estate News from NewsData.io API with specific real estate query
        try {
          const newsRes = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&q=%22real%20estate%22%20OR%20%22housing%20market%22%20OR%20%22property%20market%22&language=en`);
          const newsData = await newsRes.json();

          if (newsData && newsData.status === 'success' && newsData.results && newsData.results.length > 0) {
            liveArticles = newsData.results
              .filter(item => isRealEstateRelevant(item))
              .map((item, idx) => ({
                _id: `news-${idx}-${item.article_id || Math.random().toString(36).substring(2, 8)}`,
                title: item.title,
                excerpt: item.description || item.snippet || item.title,
                content: item.content || item.description || 'Full live report published by global media agency.',
                category: 'Market Insights',
                author: item.source_id ? item.source_id.toUpperCase() + ' Press' : 'Live Property News',
                image: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
                readTime: '4 min read',
                createdAt: item.pubDate || new Date().toISOString(),
                link: item.link
              }));
          }
        } catch (newsErr) {
          console.warn('NewsData.io live API notice:', newsErr.message);
        }

        // Combine with active CMS blogs if available
        let cmsBlogs = [];
        try {
          const res = await fetchAdminBlogs();
          if (res.data && res.data.success && res.data.blogs && res.data.blogs.length > 0) {
            cmsBlogs = res.data.blogs.filter(b => isRealEstateRelevant(b));
          }
        } catch (cmsErr) {
          console.warn('CMS blogs notice:', cmsErr.message);
        }

        // Combine CMS + Live API + Curated Real Estate Articles
        const combined = [...cmsBlogs, ...liveArticles, ...CURATED_REAL_ESTATE_ARTICLES];
        
        // Remove duplicate titles and keep strictly real estate relevant articles
        const uniqueList = [];
        const seenTitles = new Set();

        for (const item of combined) {
          if (isRealEstateRelevant(item)) {
            const cleanTitle = item.title?.trim().toLowerCase();
            if (!seenTitles.has(cleanTitle)) {
              seenTitles.add(cleanTitle);
              uniqueList.push(item);
            }
          }
        }

        setBlogs(uniqueList);
      } catch (err) {
        console.error('Error loading live market insights:', err);
        setBlogs(CURATED_REAL_ESTATE_ARTICLES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredBlog = blogs.find(b => b.featured) || blogs[0];



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aura Intelligence Reports</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Market Insights & <span className="gold-gradient-text">Property News</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Real-time analytics, expert economic forecasts, suburb price performance, and exclusive guidance for prestige real estate investors and sellers across Australia.
          </p>
        </div>
      </div>

      {/* Market Indicators Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Capital Growth YoY</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">+4.8%</p>
          <span className="text-[11px] text-emerald-400 font-medium">National Capital Index</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Auction Clearance</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">74.8%</p>
          <span className="text-[11px] text-slate-400 font-medium">Metro Capital Average</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Top Growth Suburb</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white truncate">Point Piper, NSW</p>
          <span className="text-[11px] text-cyan-400 font-medium">+12.4% Annualized</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Luxury Rental Yield</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">5.2%</p>
          <span className="text-[11px] text-purple-400 font-medium">Prime Residential Portfolio</span>
        </div>
      </div>

      {/* Featured Headline Article Banner */}
      {featuredBlog && (
        <div 
          onClick={() => setActiveBlogModal(featuredBlog)}
          className="group cursor-pointer glass-panel rounded-3xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 shadow-xl shadow-amber-500/5"
        >
          <div className="lg:col-span-7 relative overflow-hidden h-72 lg:h-auto min-h-[300px]">
            <img 
              src={featuredBlog.image} 
              alt={featuredBlog.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
              Featured Story
            </div>
          </div>
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <span>{featuredBlog.category}</span>
                <span>•</span>
                <span className="flex items-center text-slate-400"><Clock className="w-3.5 h-3.5 mr-1" /> {featuredBlog.readTime}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white group-hover:text-amber-400 transition-colors leading-tight">
                {featuredBlog.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                {featuredBlog.excerpt || featuredBlog.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center font-bold text-slate-950 text-xs">
                  {featuredBlog.author ? featuredBlog.author.charAt(0) : 'A'}
                </div>
                <span className="text-xs font-semibold text-slate-300">{featuredBlog.author || 'Aura Editorial'}</span>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                Read Article <ArrowRight className="w-4 h-4 ml-1.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search news or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-lg font-bold text-white">No insights found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or switching categories.</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <div 
              key={blog._id} 
              onClick={() => setActiveBlogModal(blog)}
              className="group cursor-pointer glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10"
            >
              <div className="space-y-4">
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={blog.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-amber-400">
                    {blog.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {blog.readTime || '5 min read'}</span>
                    <span>•</span>
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {blog.excerpt || blog.content}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-800/60 mt-auto">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[120px]">{blog.author || 'Aura Editorial'}</span>
                </div>
                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center">
                  Read <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Article Detail Modal */}
      {activeBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden my-8 shadow-2xl space-y-6">
            <button 
              onClick={() => setActiveBlogModal(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-72 md:h-96 w-full">
              <img 
                src={activeBlogModal.image} 
                alt={activeBlogModal.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="inline-block px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                  {activeBlogModal.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {activeBlogModal.title}
                </h2>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800 gap-2">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">{activeBlogModal.author || 'Aura Editorial'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> {activeBlogModal.readTime || '5 min read'}</span>
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" /> {new Date(activeBlogModal.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed space-y-4">
                <p className="font-semibold text-amber-300/90 text-base md:text-lg leading-snug">
                  {activeBlogModal.excerpt}
                </p>
                <p>
                  {activeBlogModal.content}
                </p>
                <p>
                  Key market indicators suggest continuous resilience across tier-1 capital city sub-markets. Institutional capital inflow alongside domestic high-net-worth acquisitions continue to drive transaction values to historical highs.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">Published by {activeBlogModal.author || 'AuraEstates Research Division'}</span>
                <div className="flex items-center space-x-2">
                  {activeBlogModal.link && (
                    <a
                      href={activeBlogModal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs hover:bg-slate-700 transition-colors"
                    >
                      Read Full Media Source ↗
                    </a>
                  )}
                  <button
                    onClick={() => setActiveBlogModal(null)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
