import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If VITE_API_URL does not end with /api, append /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token and ensure baseURL
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = 'demo_token_507f1f77bcf86cd799439003';
  }
  config.headers.Authorization = `Bearer ${token}`;

  const currentBase = getBaseUrl();
  if (currentBase && currentBase !== '/api') {
    config.baseURL = currentBase;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to fix broken source.unsplash.com images from backend
api.interceptors.response.use((response) => {
  if (response.data) {
    let dataStr = JSON.stringify(response.data);
    if (dataStr.includes('source.unsplash.com')) {
      dataStr = dataStr.replace(/source\.unsplash\.com\/[0-9x]+\/\?/g, 'loremflickr.com/800/600/');
      dataStr = dataStr.replace(/&sig=/g, '?lock=');
      response.data = JSON.parse(dataStr);
    }
  }
  return response;
}, (error) => Promise.reject(error));

// Auth API
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const logoutUser = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const toggleWishlist = (propertyId) => api.post(`/auth/wishlist/${propertyId}`);

// Properties API
export const fetchProperties = (params) => api.get('/properties', { params });
export const fetchPropertyById = (id) => api.get(`/properties/${id}`);
export const fetchSimilarProperties = (id) => api.get(`/properties/${id}/similar`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const updatePropertyStatus = (id, status) => api.patch(`/properties/${id}/status`, { status });
export const generatePropertyAppraisal = (id) => api.post(`/properties/${id}/appraisal`);

// Agencies API
export const fetchAgencies = () => api.get('/agencies');
export const fetchAgencyById = (id) => api.get(`/agencies/${id}`);
export const createAgency = (data) => api.post('/agencies', data);

// Agents API
export const fetchAgents = () => api.get('/agents');

// Offers & Bookings API
export const createOffer = (data) => api.post('/offers', data);
export const fetchOffers = () => api.get('/offers');
export const respondOffer = (id, data) => api.put(`/offers/${id}/respond`, data);

export const createBooking = (data) => api.post('/bookings', data);
export const fetchBookings = () => api.get('/bookings');
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status });

// Chat API
export const fetchChatMessages = (receiverId, propertyId) => api.get(`/chat/${receiverId}`, { params: { propertyId } });
export const sendChatMessage = (data) => api.post('/chat', data);
export const sendGuestMessage = (data) => api.post('/chat/guest', data);

// AI API
export const generateAIDescription = (data) => api.post('/ai/generate-description', data);
export const fetchAIValuation = (data) => api.post('/ai/valuation', data);
export const fetchAIFraudCheck = (data) => api.post('/ai/fraud-check', data);
export const sendAIChatPrompt = (prompt) => api.post('/ai/chat', { prompt });

// Payments API
export const checkoutStripePackage = (data) => api.post('/payments/checkout', data);
export const fetchPaymentHistory = () => api.get('/payments/history');

// Admin API
export const fetchAdminMetrics = () => api.get('/admin/metrics');
export const fetchAdminUsers = () => api.get('/admin/users');
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}`, { role });
export const fetchAdminProperties = () => api.get('/admin/properties');
export const fetchAdminPendingProperties = () => api.get('/admin/properties/pending');
export const approveProperty = (id) => api.patch(`/admin/properties/${id}/approve`);
export const rejectProperty = (id, reason) => api.patch(`/admin/properties/${id}/reject`, { reason });
export const deleteAdminProperty = (id) => api.delete(`/admin/properties/${id}`);
export const fetchAdminTransactions = () => api.get('/admin/transactions');
export const fetchAdminBlogs = () => api.get('/admin/blogs');
export const createAdminBlog = (data) => api.post('/admin/blogs', data);
export const fetchAdminInquiries = () => api.get('/admin/inquiries');
export const uploadPropertiesCsv = (formData) => api.post('/admin/properties/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Chat Inbox API
export const fetchChatInbox = () => api.get('/chat/inbox');
export const markThreadRead = (senderId) => api.patch(`/chat/read/${senderId}`);

// Expert Connection Requests API
export const fetchExpertRequests = () => api.get('/chat/expert-requests');
export const markExpertRequestAsRead = (id) => api.patch(`/chat/expert-requests/${id}/read`);


export default api;
