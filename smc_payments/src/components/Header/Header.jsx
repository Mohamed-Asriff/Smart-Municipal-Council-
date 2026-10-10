import React from 'react';
import './Header.css';

const Header = ({ role }) => {
  return (
    <header className="top-header">
      <div className="search-bar">
        <input type="text" placeholder="Search Services..." />
      </div>
      
      {role === 'admin' ? (
        <div className="header-profile admin-profile">
          <div className="admin-text">
            <strong>Welcome, Admin</strong>
            <span>ID-004-SYS</span>
          </div>
          <span className="avatar-icon">👤</span>
        </div>
      ) : (
        <div className="header-icons">
          <span className="icon">🔔</span>
          <span className="icon avatar-icon">👤</span>
        </div>
      )}
    </header>
  );
};

export default Header;