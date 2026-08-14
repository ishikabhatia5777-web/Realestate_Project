import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile, toggleWishlist as toggleWishlistApi, logoutUser, verifyOtp } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  
  // Global Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Please sign in to continue');

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getProfile();
          if (res.data.success) {
            setUser(res.data.user);
            setSavedProperties(res.data.user.savedProperties || []);
          }
        } catch (err) {
          console.error('Failed to load user profile', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setSavedProperties(res.data.user.savedProperties || []);
      return res.data;
    }
  };

  const verifyOtpLogin = async (data) => {
    const res = await verifyOtp(data);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setSavedProperties(res.data.user.savedProperties || []);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setSavedProperties([]);
      return res.data;
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await logoutUser();
      }
    } catch (e) {
      console.log('Logout API failed, continuing with local logout', e);
    }
    localStorage.removeItem('token');
    setUser(null);
    setSavedProperties([]);
  };

  const updateUserProfile = async (data) => {
    const { updateProfile } = await import('../services/api');
    const res = await updateProfile(data);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data;
    }
  };

  // Opens auth modal with a custom message. 
  // If user is not logged in, opens modal and returns false (action should be blocked).
  // If user is logged in, returns true (action can proceed).
  const requireAuth = (message = 'Please sign in to continue') => {
    if (!user) {
      setAuthModalMessage(message);
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const openAuthModal = (message = 'Please sign in to continue') => {
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const toggleSavedProperty = async (propertyId) => {
    if (!user) {
      requireAuth('Sign in to save properties to your wishlist');
      return false;
    }
    try {
      const res = await toggleWishlistApi(propertyId);
      if (res.data.success) {
        setSavedProperties(res.data.savedProperties || []);
        setUser(prev => prev ? { ...prev, savedProperties: res.data.savedProperties } : prev);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const isSaved = (propertyId) => {
    if (!propertyId) return false;
    const targetId = String(propertyId._id || propertyId);
    return savedProperties.some(p => String(p._id || p) === targetId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        savedProperties,
        login,
        register,
        logout,
        toggleSavedProperty,
        isSaved,
        requireAuth,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMessage,
        updateUserProfile,
        verifyOtpLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
