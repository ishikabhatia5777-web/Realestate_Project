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
        navigate('/'); // Redirect to Homepage with Dashboard button shown in Navbar
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
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Back & Home Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors">
            Back to Home
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Building2 className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join Australia's luxury real estate portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector pills */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Select Account Type (RBAC)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'buyer', label: 'Buyer / Renter' },
                { id: 'seller', label: 'Property Seller (FSBO)' },
                { id: 'agent', label: 'Real Estate Agent' },
                { id: 'agency', label: 'Agency Owner' },
                { id: 'admin', label: 'Admin User' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    role === r.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Julian Thorne"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="julian@prestigerealty.com.au"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+61 400 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
