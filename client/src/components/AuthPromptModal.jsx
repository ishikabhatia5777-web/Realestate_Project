import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Mail, Lock, User, Phone, ArrowRight, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { id: 'admin', label: '🛡️ Admin', desc: 'Platform administrator' },
  { id: 'buyer', label: '🏠 Buyer', desc: 'Browse & purchase properties' },
  { id: 'seller', label: '🏷️ Seller', desc: 'List your property for sale' },
  { id: 'agent', label: '🤝 Agent', desc: 'Manage listings & clients' },
  { id: 'agency', label: '🏢 Agency', desc: 'Run your real estate agency' },
];

const AuthPromptModal = ({ isOpen, onClose, message = 'Please sign in to continue' }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getDashboardRoute = (userRole) => {
    if (userRole === 'super_admin' || userRole === 'admin') return '/dashboard/admin';
    if (userRole === 'agency') return '/dashboard/agency';
    if (userRole === 'agent') return '/dashboard/agent';
    if (userRole === 'seller') return '/dashboard/seller';
    return '/dashboard/buyer';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'login') {
        res = await login({ email: form.email, password: form.password });
      } else {
        res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role });
      }
      if (res && res.success) {
        onClose();
        navigate(getDashboardRoute(res.user.role));
      }
    } catch (err) {
      setError(err.response?.data?.message || (mode === 'login' ? 'Invalid email or password' : 'Registration failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md glass-panel rounded-3xl border border-slate-300 shadow-2xl overflow-hidden"
          >
            {/* Gold top border */}
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-amber-500 to-amber-400" />

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Building2 className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-xs text-sky-500">{message}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'login' ? 'bg-sky-500 text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'register' ? 'bg-sky-500 text-slate-950' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Register: Role Selector */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`p-2.5 rounded-xl text-left transition-all border ${role === r.id ? 'bg-sky-500 border-sky-500 text-slate-950' : 'bg-white border-slate-200 text-slate-500 hover:border-sky-500/40 hover:text-slate-900'}`}
                        >
                          <div className="text-xs font-bold">{r.label}</div>
                          <div className="text-[10px] opacity-70 mt-0.5">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Register: Name */}
                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                {/* Register: Phone */}
                {mode === 'register' && (
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      name="phone"
                      type="text"
                      placeholder="Phone Number (optional)"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                )}

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Demo Credentials */}
              {mode === 'login' && (
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Demo: any role — use password <span className="text-sky-500 font-bold">password123</span></p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;
