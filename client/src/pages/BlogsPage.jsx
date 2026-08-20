import React, { useEffect, useState } from 'react';
import { fetchAdminBlogs } from '../services/api';
import { 
  BookOpen, Sparkles, TrendingUp, Calendar, User, 
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
  const [blogs, setBlogs] = useState(CURATED_REAL_ESTATE_ARTICLES);
  const [filteredBlogs, setFilteredBlogs] = useState(CURATED_REAL_ESTATE_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBlogModal, setActiveBlogModal] = useState(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const res = await fetchAdminBlogs();
        if (res.data?.success && res.data.blogs?.length > 0) {
          const dbBlogs = res.data.blogs
            .filter(isRealEstateRelevant)
            .map(b => ({
              ...b,
              category: b.category || 'Market Insights'
            }));

          const allBlogsMap = new Map();
          [...dbBlogs, ...CURATED_REAL_ESTATE_ARTICLES].forEach(b => {
            allBlogsMap.set(b.title, b);
          });
          
          const merged = Array.from(allBlogsMap.values())
            .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

          setBlogs(merged);
        }
      } catch (err) {
        console.warn('Failed to fetch admin blogs, using curated list.', err);
      }
    };
    loadBlogs();
  }, []);

  useEffect(() => {
    let result = blogs;

    if (selectedCategory !== 'All') {
      result = result.filter(b => 
        (b.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.title || '').toLowerCase().includes(q) || 
        (b.excerpt || '').toLowerCase().includes(q) ||
        (b.content || '').toLowerCase().includes(q)
      );
    }

    setFilteredBlogs(result);
  }, [searchQuery, selectedCategory, blogs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-500 text-[10px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          <span>Real Estate Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Property Market <span className="brand-gradient-text">Insights</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Stay ahead of the market with expert analysis on suburb trends, investment strategies, architectural innovations, and high-end residential data.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="space-y-6">
        {/* Category Tabs */}

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-lg font-bold text-slate-900">No insights found</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or switching categories.</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
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
              className="group cursor-pointer glass-panel rounded-2xl overflow-hidden border border-slate-200 hover:border-sky-500/40 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg hover:shadow-sky-500/10"
            >
              <div className="space-y-4">
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={blog.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-50/80 backdrop-blur-md border border-slate-200 text-[11px] font-bold text-sky-500">
                    {blog.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {blog.readTime || '5 min read'}</span>
                    <span>•</span>
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-500 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {blog.excerpt || blog.content}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-200/60 mt-auto">
                <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                  <User className="w-3.5 h-3.5 text-sky-500" />
                  <span className="truncate max-w-[120px]">{blog.author || 'Aura Editorial'}</span>
                </div>
                <span className="text-xs font-bold text-sky-500 group-hover:translate-x-1 transition-transform flex items-center">
                  Read <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {activeBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-200 bg-white overflow-hidden my-8 shadow-2xl space-y-6">
            <button 
              onClick={() => setActiveBlogModal(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-50/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
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
                <span className="inline-block px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                  {activeBlogModal.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {activeBlogModal.title}
                </h2>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-4 border-b border-slate-200 gap-2">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-sky-500" />
                  <span className="font-bold text-slate-700">{activeBlogModal.author || 'Aura Editorial'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-sky-500" /> {activeBlogModal.readTime || '5 min read'}</span>
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-sky-500" /> {new Date(activeBlogModal.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-600 text-sm md:text-base leading-relaxed space-y-4">
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

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">Published by {activeBlogModal.author || 'AuraEstates Research Division'}</span>
                <div className="flex items-center space-x-2">
                  {activeBlogModal.link && (
                    <a
                      href={activeBlogModal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sky-500 font-bold text-xs hover:bg-slate-200 transition-colors"
                    >
                      Read Full Media Source ↗
                    </a>
                  )}
                  <button
                    onClick={() => setActiveBlogModal(null)}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors"
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
