import React, { useState } from 'react';
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
import { 
  defaultCitizenProfile, 
  initialComplaints, 
  initialPayments, 
  initialNotices 
} from './data/userPortalData';

export default function App() {
  const [lang, setLang] = useState('en');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPayBill, setSelectedPayBill] = useState(null);
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });

  // Authenticated Citizen User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kmc_citizen_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Current view: 'landing' | 'portal'
  const [currentView, setCurrentView] = useState('landing');
  const [portalTab, setPortalTab] = useState('dashboard');

  // Dynamic user portal datasets
  // const [complaints, setComplaints] = useState(() => {
  //   const saved = localStorage.getItem('kmc_user_complaints');
  //   return saved ? JSON.parse(saved) : initialComplaints;
  // });

  // const [payments, setPayments] = useState(() => {
  //   const saved = localStorage.getItem('kmc_user_payments');
  //   return saved ? JSON.parse(saved) : initialPayments;
  // });

  const [notices] = useState(initialNotices);

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleAuthSuccess = (user) => {
    const citizen = user || defaultCitizenProfile;
    setCurrentUser(citizen);
    localStorage.setItem('kmc_citizen_user', JSON.stringify(citizen));
    setAuthModalState({ isOpen: false, mode: 'login' });
    setCurrentView('portal');
    setPortalTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kmc_citizen_user');
    localStorage.removeItem('kmc_auth_token');
    setCurrentView('landing');
  };

  const handleUpdateUser = (updatedProfile) => {
    setCurrentUser(updatedProfile);
    localStorage.setItem('kmc_citizen_user', JSON.stringify(updatedProfile));
  };

  const handleReportSuccess = (newTicket) => {
    if (newTicket) {
      const updated = [newTicket, ...complaints];
      setComplaints(updated);
      localStorage.setItem('kmc_user_complaints', JSON.stringify(updated));
    }
  };

  // const handleOpenPaymentModal = (bill = null) => {
  //   setSelectedPayBill(bill);
  //   setIsPayOpen(true);
  // };

  // const handlePaymentCompleted = (receipt) => {
  //   if (receipt && selectedPayBill) {
  //     const updated = payments.map((p) => {
  //       if (p.id === selectedPayBill.id) {
  //         return {
  //           ...p,
  //           status: 'Paid',
  //           paidAt: receipt.date || new Date().toLocaleString(),
  //           receiptNo: receipt.receiptNo || 'REC-KMC-' + Math.floor(100000 + Math.random() * 900000)
  //         };
  //       }
  //       return p;
  //     });
  //     setPayments(updated);
  //     localStorage.setItem('kmc_user_payments', JSON.stringify(updated));
  //   }
  // };

  // If user is inside Citizen Portal Interface
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

  // Otherwise, render Public Landing Page with login banner & navigation
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
      {/* <ReportComplaintModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onTicketCreated={handleReportSuccess}
      /> */}

      {/* <PaymentPortalModal
        isOpen={isPayOpen}
        onClose={() => {
          setIsPayOpen(false);
          setSelectedPayBill(null);
        }}
        lang={lang}
        prefillBill={selectedPayBill}
        onPaymentSuccess={handlePaymentCompleted}
      /> */}

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
