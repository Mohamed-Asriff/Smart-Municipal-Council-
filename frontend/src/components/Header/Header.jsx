import React from 'react';
import './Header.css';

export default function Header({ activeTab, setActiveTab, role = 'citizen' }) {
  const isAdmin = role === 'admin';

  return (
    <header className="site-header">
      {/* Top Info Bar */}
      <div className="top-bar">
        <div>
          Emergency Helpline: <strong className="emergency-text">1990 Suwa Seriya</strong> | KMC Secretariat: <span className="secretariat-text">067-2220261</span>
        </div>
        
        <div className="top-right-actions">
          <button className="notif-btn" title="Notifications" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notif-dot"></span>
          </button>

          <div className="lang-switch">
            <button className="lang-btn active" type="button">EN</button>
            <button className="lang-btn" type="button">தமிழ்</button>
            <button className="lang-btn" type="button">සිංහල</button>
          </div>

          {/* User Badge changes based on role */}
          <div className="header-user-badge">
            <div className="header-avatar">{isAdmin ? 'AD' : 'AH'}</div>
            <div className="header-user-details">
              <span className="header-user-name">{isAdmin ? 'Welcome, Admin' : 'A. Hassan'}</span>
              <span className="header-user-role">{isAdmin ? 'ID-004-SYS' : 'Resident'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="main-header">
        <div className="brand-section">
          <div className="kmc-badge">KMC</div>
          <div>
            <h1 className="brand-title">
              Kalmunai <span>Municipal Council</span>
            </h1>
            <p className="brand-subtitle">கல்முனை மாநகர சபை | கல்முனே மகா நகர සභාව</p>
          </div>
        </div>

        {/* Navigation Tabs (Only rendered for Citizens) */}
        {!isAdmin && (
          <nav className="nav-container">
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('submit')}
              className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
            >
              Submit New
            </button>
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('track')}
              className={`nav-tab ${activeTab === 'track' ? 'active' : ''}`}
            >
              Track Complaint
            </button>
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('history')}
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            >
              My History
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}