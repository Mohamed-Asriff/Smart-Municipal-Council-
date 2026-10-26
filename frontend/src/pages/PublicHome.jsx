import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import AboutSection from '../components/home/AboutSection';
import ServicesSection from '../components/home/ServicesSection';
import TicketTracker from '../components/home/TicketTracker';
import NewsSection from '../components/home/NewsSection';

export default function PublicHome({ setView, openAuth }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* Floating Navbar */}
      <Navbar onOpenPortal={() => setView('portal')} />

      <main>
        {/* Hero is now at the very top, behind the navbar */}
        <Hero onOpenAuth={openAuth} />
        
        <AboutSection />
        <ServicesSection
          onOpenReport={() => openAuth('register')}
          onOpenPay={() => openAuth('login')}
          onOpenWaste={() => openAuth('login')}
        />
        <TicketTracker />
        <NewsSection />
      </main>

      <Footer />
    </div>
  );
}