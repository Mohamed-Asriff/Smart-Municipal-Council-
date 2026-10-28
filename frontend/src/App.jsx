import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

import PublicHome from './pages/PublicHome';
import CitizenPortal from './pages/CitizenPortal';
import AdminPortal from './pages/AdminPortal';

import AuthModal from './features/auth/AuthModal';
import Chatbot from './features/chatbot/Chatbot';
import { ChatbotButton } from './features/chatbot/ChatbotButton';

const STAFF_ROLES = new Set(['ADMIN', 'OFFICER']);
const isStaff = (role) => STAFF_ROLES.has(role);

/** Return the first segment of the current pathname (ignores trailing /, //, ?query, #hash). */
const getPageSegment = () => {
  return window.location.pathname
    .replace(/^\/+/, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
};

const AppContent = () => {
  // NOTE: AuthContext should expose `loading` (true until the session has been
  // hydrated from storage/token). If it doesn't, the refresh-on-protected-route
  // bug still exists — see the 400ms fallback below.
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();

  // 1. Initialise view from URL
  const [view, setView] = useState(() => {
    const path = getPageSegment();
    if (path === 'portal' || path === 'admin') return path;
    return 'landing'; // everything else renders the landing page
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [chatOpen, setChatOpen] = useState(false);

  const prevViewRef = useRef(view);

  // 2. Keep the URL and view in sync
  useEffect(() => {
    if (view === 'landing') {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/portal' || currentPath === '/admin') {
        window.history.replaceState(null, '', '/home');
      }
    } else {
      const target = `/${view}`;
      if (window.location.pathname === target) {
        // URL is already correct — do NOT push another entry (popstate case)
      } else if (prevViewRef.current !== view) {
        // User-initiated view change → add history entry so Back works
        window.history.pushState(null, '', target);
      } else {
        // Mount-time normalisation → replace, don't grow history
        window.history.replaceState(null, '', target);
      }
    }
    prevViewRef.current = view;
    try {
      localStorage.setItem('kmc_active_view', view);
    } catch {
      /* storage may be unavailable */
    }
  }, [view]);

  // 3. Scroll to the correct section on initial landing render / refresh
  useEffect(() => {
    if (view !== 'landing') return;

    const section = getPageSegment();
    if (!section || section === 'home') {
      window.scrollTo({ top: 0 });
      return;
    }

    // rAF loop: keeps retrying until the section has rendered (no arbitrary timeout)
    let rafId;
    const tryScroll = () => {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        rafId = requestAnimationFrame(tryScroll);
      }
    };
    rafId = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(rafId);
  }, [view]);

  // 4. Browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      const path = getPageSegment();

      if (path === 'portal' || path === 'admin') {
        if (user) {
          setView(path);
        } else {
          // Logged out — send them home AND fix the URL (previously this desynced)
          setView('landing');
          window.history.replaceState(null, '', '/home');
        }
        return;
      }

      setView('landing');

      if (!path || path === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      let rafId;
      const tryScroll = () => {
        const el = document.getElementById(path);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else rafId = requestAnimationFrame(tryScroll);
      };
      rafId = requestAnimationFrame(tryScroll);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  // 5. Guard protected views (fixes the refresh race + adds role check)
  useEffect(() => {
    if (authLoading) return; // still hydrating — wait

    if (!user && (view === 'portal' || view === 'admin')) {
      // If AuthContext exposes `loading` and reports false, redirect immediately.
      // Otherwise, give hydration a short grace period so a logged-in user
      // refreshing on /portal doesn't get kicked to /home.
      const delay = authLoading === false ? 0 : 400;
      const timer = setTimeout(() => {
        setView((v) => (v === 'portal' || v === 'admin' ? 'landing' : v));
      }, delay);
      return () => clearTimeout(timer);
    }

    // Non-staff users cannot stay on /admin
    if (view === 'admin' && user && !isStaff(user.role)) {
      setView('portal');
    }
  }, [user, authLoading, view]);

  const handleAuthSuccess = (userData) => {
    const targetView = isStaff(userData?.role) ? 'admin' : 'portal';
    setView(targetView);
    setAuthOpen(false);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // Show a spinner while auth is hydrating, OR while a protected view is waiting
  // on a user object that may still be arriving from storage.
  const showAuthSpinner =
    authLoading === true ||
    ((view === 'portal' || view === 'admin') && !user && authLoading !== false);

  if (showAuthSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1E33]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const canSeeAdmin = Boolean(user) && isStaff(user.role);

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

      {view === 'admin' && canSeeAdmin && <AdminPortal />}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <ChatbotButton onClick={() => setChatOpen((o) => !o)} isOpen={chatOpen} />
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