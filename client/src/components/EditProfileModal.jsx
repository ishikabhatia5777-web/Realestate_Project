import React, { useState, useEffect } from 'react';
import { X, User, Phone, Image, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    bio: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        bio: user.bio || ''
      });
      setError('');
      setSuccess(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    
    try {
      await updateUserProfile(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <User className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
              <p className="text-xs text-slate-500">Update your personal details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Profile Updated!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Avatar Image URL</label>
              <div className="relative">
                <Image className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
                />
              </div>
            </div>
            
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Bio</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-xs hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;
