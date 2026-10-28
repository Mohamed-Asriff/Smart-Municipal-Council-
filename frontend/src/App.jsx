import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

import PublicHome from './pages/PublicHome';
import CitizenPortal from './pages/CitizenPortal';
import AdminPortal from './pages/AdminPortal';

import AuthModal from './features/auth/AuthModal';
import Chatbot from './features/chatbot/Chatbot';
import { ChatbotButton } from './features/chatbot/ChatbotButton';

const AppContent = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();

  // === STATE (Persisted to localStorage on refresh) ===
  const [view, setView] = useState(() => {
    return localStorage.getItem('kmc_active_view') || 'landing';
  });
  
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [chatOpen, setChatOpen] = useState(false);

  // === EFFECTS ===
  
  // 1. Save the current view whenever it changes
  useEffect(() => {
    localStorage.setItem('kmc_active_view', view);
  }, [view]);

  // 2. Auto-redirect to landing if the user is not logged in
  useEffect(() => {
    if (!user && (view === 'portal' || view === 'admin')) {
      setView('landing');
    }
  }, [user, view]);

  // === HANDLERS ===
  const handleAuthSuccess = (userData) => {
    const targetView = (userData.role === 'ADMIN' || userData.role === 'OFFICER') ? 'admin' : 'portal';
    setView(targetView);
    setAuthOpen(false);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // === RENDER ===
  return (
    <>
      {view === 'landing' && (
        <PublicHome
          setView={setView}
          openAuth={handleOpenAuth}
          openChat={() => setChatOpen(true)}
        />
      )}

      {view === 'portal' && user && (
        <CitizenPortal onBackToPublic={() => setView('landing')} />
      )}

      {view === 'admin' && user && (
        <AdminPortal />
        )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <ChatbotButton onClick={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} lang={lang} />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ToastProvider>
    </AuthProvider>
  );
}