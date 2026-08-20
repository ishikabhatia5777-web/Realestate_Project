import React, { useState } from 'react';
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
  Home
} from 'lucide-react';

const Navbar = ({ onOpenAIChat }) => {
  const { user, logout, savedProperties, requireAuth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>

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

            {/* Market Insights visible to Buyer, Seller, Agent, Guest (hidden for Admin) */}
            {(!user || user.role !== 'admin') && (
              <Link to="/blogs" className={linkClass('/blogs')}>
                Market Insights
              </Link>
            )}

            {/* Direct Dashboard Nav Link for Logged In Users */}
            {user && (
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
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIChat}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/30 text-cyan-300 hover:text-slate-900 hover:border-cyan-400 transition-all shadow-sm"
            >
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold">Aura AI</span>
            </button>


            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-sky-600 dark:border-slate-200 dark:bg-white/60 dark:text-slate-600 dark:hover:text-sky-500 dark:hover:border-sky-500/30 transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-sky-500" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
            </button>

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
                  <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl shadow-2xl py-2 border border-slate-200 z-50">
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
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-200 dark:bg-white/60 dark:text-slate-600"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-5 h-5 text-sky-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
            </button>

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
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass('/')}
          >
            Home Page
          </Link>

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

          {(!user || user.role !== 'admin') && (
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
