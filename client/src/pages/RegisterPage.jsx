import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await register({ name, email, password, phone, role });
      if (res && res.success) {
        const u = res.user;
        if (!u) {
          navigate('/');
        } else if (u.role === 'super_admin' || u.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (u.role === 'agency') {
          navigate('/dashboard/agency');
        } else if (u.role === 'agent') {
          navigate('/dashboard/agent');
        } else if (u.role === 'seller') {
          navigate('/dashboard/seller');
        } else {
          navigate('/dashboard/buyer');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl">
        
        {/* Back & Home Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <Link to="/" className="text-xs font-bold text-slate-500 hover:text-sky-500 transition-colors">
            Back to Home
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl brand-gradient-bg flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Building2 className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500">Join Australia's luxury real estate portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-600">Account Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
            >
              <option value="buyer">Buyer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-600">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Julian Thorne"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-600">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="julian@prestigerealty.com.au"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-600">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61 400 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-500 font-bold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
