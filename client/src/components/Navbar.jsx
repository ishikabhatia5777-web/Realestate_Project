import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Building2, 
  Search, 
  Heart, 
  User, 
  Bot, 
  Sun, 
  Moon, 
  LogOut, 
  LayoutDashboard, 
  ShieldAlert,
  Menu,
  X,
  Home,
  MessageSquare,
  Bell,
  Settings,
  BarChart2,
  Users
} from 'lucide-react';

const Navbar = ({ onOpenAIChat }) => {
  const { user, logout, savedProperties, requireAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsNavOpen, setSettingsNavOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close Settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => 
    `transition-colors ${isActive(path) ? 'text-sky-500 font-extrabold shadow-sky-500/50 drop-shadow-md' : 'text-slate-600 hover:text-sky-500 font-medium'}`;
    
  const mobileLinkClass = (path) =>
    `block py-2 ${isActive(path) ? 'text-sky-500 font-extrabold bg-slate-100/40 px-3 -ml-3 rounded-lg' : 'text-slate-600 font-medium hover:text-sky-500'}`;

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return '/dashboard/admin';
      case 'agency':
        return '/dashboard/agency';
      case 'agent':
        return '/dashboard/agent';
      case 'seller':
        return '/dashboard/seller';
      default:
        return '/dashboard/buyer';
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block">
                AURA<span className="brand-gradient-text">ESTATES</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold block">
                Luxury Real Estate
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7">
            {(!user || (user.role !== 'agent' && user.role !== 'admin' && user.role !== 'super_admin')) && (
              <Link to="/" className={linkClass('/')}>
                Home
              </Link>
            )}

            {/* Show Buy, Rent, Sold, Agencies ONLY to Buyer or Guest users */}
            {(!user || user.role === 'buyer') && (
              <>
                <Link to="/properties?listingType=Sale" className={linkClass('/properties?listingType=Sale')}>
                  Buy
                </Link>
                <Link to="/properties?listingType=Rent" className={linkClass('/properties?listingType=Rent')}>
                  Rent
                </Link>
                <Link to="/sold" className={linkClass('/sold')}>
                  Sold
                </Link>
                <Link to="/agents" className={linkClass('/agents')}>
                  Find Agents
                </Link>
              </>
            )}

            {/* Market Insights visible to Buyer, Seller, Guest (hidden for Admin, Agent) */}
            {(!user || (user.role !== 'admin' && user.role !== 'agent')) && (
              <Link to="/blogs" className={linkClass('/blogs')}>
                Market Insights
              </Link>
            )}

            {/* Direct Dashboard Nav Link for Logged In Users */}
            {user && (user.role !== 'agent' && user.role !== 'admin' && user.role !== 'super_admin') && (
              <Link 
                to={getDashboardRoute()} 
                className={`px-3.5 py-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm ${
                  location.pathname.startsWith('/dashboard') 
                    ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-sky-500/30' 
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-500 hover:bg-sky-500/20'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Actions & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* AI Assistant Button - hidden for agents */}
            {(!user || user.role !== 'agent') && (
              <button
                onClick={onOpenAIChat}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/30 text-cyan-300 hover:text-slate-900 hover:border-cyan-400 transition-all shadow-sm"
              >
                <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold">Aura AI</span>
              </button>
            )}

            {/* Settings Dropdown - shown for agents and admins */}
            {user && (user.role === 'agent' || user.role === 'admin' || user.role === 'super_admin') && (
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setSettingsNavOpen(!settingsNavOpen)}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-500 hover:border-sky-500/40 transition-all"
                  title="Settings"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>

                {settingsNavOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 overflow-hidden">
                    {user.role === 'agent' && (
                      <>
                        <button
                          onClick={() => { navigate('/dashboard/agent?tab=messages'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Live Chat Inbox</span>
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard/agent?tab=requests'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Connection Requests</span>
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard/agent?tab=profile'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Profile Settings</span>
                        </button>
                      </>
                    )}
                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <>
                        <button
                          onClick={() => { navigate('/dashboard/admin?tab=metrics'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>Overview Metrics</span>
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard/admin?tab=properties'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Properties</span>
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard/admin?tab=users'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Users</span>
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard/admin?tab=agents'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Agents</span>
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard/admin?tab=leads'); setSettingsNavOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center space-x-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>Leads</span>
                        </button>

                      </>
                    )}
                  </div>
                )}
              </div>
            )}




            {/* Saved Wishlist (Shown ONLY to Buyer and Guest users) */}
            {(!user || user.role === 'buyer') && (
              <button
                onClick={() => {
                  if (requireAuth('Sign in to view your saved properties')) {
                    navigate('/wishlist');
                  }
                }}
                className={`relative p-2 rounded-lg border transition-colors ${
                  location.pathname === '/wishlist'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-rose-400'
                }`}
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {savedProperties.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-slate-900 text-[11px] font-bold flex items-center justify-center">
                    {savedProperties.length}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl border border-slate-200 bg-white hover:border-sky-500/50 transition-all"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="text-left hidden lg:block pr-1">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">{user.name}</span>
                    <span className="text-[10px] text-sky-500 font-semibold uppercase tracking-wider block">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border border-slate-200 z-50">
                    <div className="px-4 py-2 border-b border-slate-200/80">
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100/60 hover:text-sky-500 transition-colors"
                    >
                      <Home className="w-4 h-4 text-sky-500" />
                      <span>Home Page</span>
                    </Link>
                    
                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100/60 hover:text-sky-500 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-500" />
                      <span>My Dashboard</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">


            <button
              onClick={onOpenAIChat}
              className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30"
            >
              <Bot className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 px-4 pt-4 pb-6 space-y-4">
          {(!user || (user.role !== 'agent' && user.role !== 'admin' && user.role !== 'super_admin')) && (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass('/')}
            >
              Home Page
            </Link>
          )}

          {(!user || user.role === 'buyer') && (
            <>
              <Link
                to="/properties?listingType=Sale"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/properties?listingType=Sale')}
              >
                Buy Properties
              </Link>
              <Link
                to="/properties?listingType=Rent"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/properties?listingType=Rent')}
              >
                Rent Properties
              </Link>
              <Link
                to="/sold"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/sold')}
              >
                Sold Properties
              </Link>
              <Link
                to="/agents"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass('/agents')}
              >
                Find Agents
              </Link>
            </>
          )}

          {(!user || (user.role !== 'admin' && user.role !== 'agent')) && (
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass('/blogs')}
            >
              Market Insights & News
            </Link>
          )}

          {user ? (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {(user.role !== 'agent' && user.role !== 'admin' && user.role !== 'super_admin') && (
                <Link
                  to={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg font-bold text-sm ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-sky-600 text-slate-900'
                      : 'bg-sky-500 text-slate-950'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard ({user.role})</span>
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-center py-2 text-rose-400 text-sm font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
