import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import TicketTracker from './components/TicketTracker';
import NewsSection from './components/NewsSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import ReportComplaintModal from './components/ReportComplaintModal';
import PaymentPortalModal from './components/PaymentPortalModal';
import AuthModal from './components/AuthModal';
import CitizenPortal from './components/portal/CitizenPortal';
import AdminPortal from './components/admin/AdminPortal';
import { api } from './services/api';

export default function App() {
  const [lang, setLang] = useState('en');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPayBill, setSelectedPayBill] = useState(null);
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });

  // Authenticated user (citizen OR admin)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kmc_citizen_user');
    return saved ? JSON.parse(saved) : null;
  });

  // View state for citizens
  const [currentView, setCurrentView] = useState('landing');
  const [portalTab, setPortalTab] = useState('dashboard');

  // All data comes from the backend now
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);

  // Fetch user data whenever logged-in user changes
  useEffect(() => {
    if (!currentUser || currentUser.role === 'ADMIN') {
      setComplaints([]);
      setPayments([]);
      setNotices([]);
      return;
    }
    (async () => {
      const [c, p, n] = await Promise.all([
        api.getComplaints(),
        api.getPayments(),
        api.getNotices()
      ]);
      setComplaints(Array.isArray(c) ? c : []);
      setPayments(Array.isArray(p) ? p : []);
      setNotices(Array.isArray(n) ? n : []);
    })();
  }, [currentUser]);

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('kmc_citizen_user', JSON.stringify(user));
    setAuthModalState({ isOpen: false, mode: 'login' });
    // Only send citizens to portal; admins auto-route via render logic below
    if (user?.role !== 'ADMIN') {
      setCurrentView('portal');
      setPortalTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kmc_citizen_user');
    localStorage.removeItem('kmc_auth_token');
    setComplaints([]);
    setPayments([]);
    setNotices([]);
    setCurrentView('landing');
    setPortalTab('dashboard');
  };

  const handleUpdateUser = (updatedProfile) => {
    setCurrentUser(updatedProfile);
    localStorage.setItem('kmc_citizen_user', JSON.stringify(updatedProfile));
  };

  const handleReportSuccess = (newTicket) => {
    if (newTicket) {
      setComplaints((prev) => [newTicket, ...prev]);
    }
  };

  const handleOpenPaymentModal = (bill = null) => {
    setSelectedPayBill(bill);
    setIsPayOpen(true);
  };

  const handlePaymentCompleted = () => {
    // Refresh payments from server after successful payment
    (async () => {
      const p = await api.getPayments();
      setPayments(Array.isArray(p) ? p : []);
    })();
  };

  // ============================================================
  // Route 1: ADMIN — always show the admin console
  // ============================================================
  if (currentUser?.role === 'ADMIN') {
    return (
      <AdminPortal
        user={currentUser}
        onLogout={handleLogout}
        onBackToPublic={() => setCurrentView('landing')}
      />
    );
  }

  // ============================================================
  // Route 2: CITIZEN PORTAL
  // ============================================================
  if (currentView === 'portal' && currentUser) {
    return (
      <CitizenPortal
        user={currentUser}
        complaints={complaints}
        payments={payments}
        notices={notices}
        lang={lang}
        setLang={setLang}
        initialTab={portalTab}
        onLogout={handleLogout}
        onBackToPublic={() => setCurrentView('landing')}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenPayment={handleOpenPaymentModal}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  // ============================================================
  // Route 3: PUBLIC LANDING PAGE
  // ============================================================
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onOpenPortal={() => setCurrentView('portal')}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero lang={lang} />

        {/* Services Showcase */}
        <ServicesSection
          lang={lang}
          onOpenReport={() => {
            if (!currentUser) {
              handleOpenAuth('register');
            } else {
              setIsReportOpen(true);
            }
          }}
          onOpenPay={() => {
            if (!currentUser) {
              handleOpenAuth('login');
            } else {
              setCurrentView('portal');
              setPortalTab('payments');
            }
          }}
        />

        {/* Live Complaint Status Tracker */}
        <TicketTracker lang={lang} />

        {/* Public Announcements & News */}
        <NewsSection lang={lang} />

        {/* Kalmunai Zone Map */}
        <MapSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Interactive Modals */}
      <ReportComplaintModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onTicketCreated={handleReportSuccess}
      />

      <PaymentPortalModal
        isOpen={isPayOpen}
        onClose={() => {
          setIsPayOpen(false);
          setSelectedPayBill(null);
        }}
        lang={lang}
        prefillBill={selectedPayBill}
        onPaymentSuccess={handlePaymentCompleted}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}