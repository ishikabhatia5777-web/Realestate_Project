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
import BlogsPage from './pages/BlogsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SecurityPage from './pages/SecurityPage';
import SitemapPage from './pages/SitemapPage';

import WishlistPage from './pages/WishlistPage';

import AdminDashboard from './pages/Dashboards/AdminDashboard';
import AgencyDashboard from './pages/Dashboards/AgencyDashboard';
import AgentDashboard from './pages/Dashboards/AgentDashboard';
import SellerDashboard from './pages/Dashboards/SellerDashboard';
import BuyerDashboard from './pages/Dashboards/BuyerDashboard';

import AuthPromptModal from './components/AuthPromptModal';

const AppLayout = ({ isAIChatOpen, setIsAIChatOpen }) => {
  const { authModalOpen, closeAuthModal, authModalMessage } = useAuth();
  const location = useLocation();

  // Hide Navbar & Footer on login and register pages until user signs in and navigates away
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {!isAuthPage && <Navbar onOpenAIChat={() => setIsAIChatOpen(true)} />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/agencies" element={<AgenciesPage />} />
          <Route path="/agencies/:id" element={<AgencyDetailPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />

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
