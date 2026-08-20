import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';

import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AgenciesPage from './pages/AgenciesPage';
import AgencyDetailPage from './pages/AgencyDetailPage';
import FindAgentsPage from './pages/FindAgentsPage';
import BlogsPage from './pages/BlogsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import WishlistPage from './pages/WishlistPage';
import SoldPage from './pages/SoldPage';
import SuburbProfilePage from './pages/SuburbProfilePage';

import AdminDashboard from './pages/Dashboards/AdminDashboard';
import AgencyDashboard from './pages/Dashboards/AgencyDashboard';
import AgentDashboard from './pages/Dashboards/AgentDashboard';
import SellerDashboard from './pages/Dashboards/SellerDashboard';
import BuyerDashboard from './pages/Dashboards/BuyerDashboard';

import AuthPromptModal from './components/AuthPromptModal';

const AppLayout = ({ isAIChatOpen, setIsAIChatOpen }) => {
  const { authModalOpen, closeAuthModal, authModalMessage } = useAuth();
  const location = useLocation();

  // Hide Navbar & Footer on login, register, and password reset pages until user signs in and navigates away
  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-slate-50 dark:text-slate-100 transition-colors duration-200">
      {!isAuthPage && <Navbar onOpenAIChat={() => setIsAIChatOpen(true)} />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/agencies" element={<AgenciesPage />} />
          <Route path="/agencies/:id" element={<AgencyDetailPage />} />
          <Route path="/agents" element={<FindAgentsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/sold" element={<SoldPage />} />
          <Route path="/suburbs/:suburbName" element={<SuburbProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dashboards */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/agency" element={<AgencyDashboard />} />
          <Route path="/dashboard/agent" element={<AgentDashboard />} />
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}

      {/* Floating AI Assistant Concierge Drawer */}
      <AIChatbot isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Auth Prompt Modal */}
      <AuthPromptModal isOpen={authModalOpen} onClose={closeAuthModal} message={authModalMessage} />
    </div>
  );
};

const App = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppLayout isAIChatOpen={isAIChatOpen} setIsAIChatOpen={setIsAIChatOpen} />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
