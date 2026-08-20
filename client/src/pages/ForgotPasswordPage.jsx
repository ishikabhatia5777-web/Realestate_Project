import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Building2, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { verifyOtpLogin } = useAuth();
  
  const [step, setStep] = useState(1); // 1 for email, 2 for OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setMessage(res.data.data || 'OTP sent successfully. Please check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await verifyOtpLogin({ email, otp });
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
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl">
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
          <h2 className="text-2xl font-extrabold text-slate-900">
            {step === 1 ? 'Forgot Password / OTP Login' : 'Verify OTP'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1 
              ? "Enter your email to receive a 6-digit login or password reset code."
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only numbers
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-center tracking-[0.5em] text-lg font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setMessage('');
                setError('');
              }}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
