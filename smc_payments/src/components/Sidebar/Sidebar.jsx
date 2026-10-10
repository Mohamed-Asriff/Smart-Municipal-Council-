import React from 'react';
import './Sidebar.css';

const Sidebar = ({ role, activeMenu }) => {
  const citizenMenus = ['My Profile', 'Complaints', 'Transit Pass', 'Permits', 'Payments', 'Settings'];
  const adminMenus = ['Admin Dashboard', 'User Accounts', 'Manage Complaints', 'Payment Management', 'IoT Monitoring', 'Reports'];

  const menus = role === 'admin' ? adminMenus : citizenMenus;

  return (
    <aside className="sidebar">
      <h2 className="brand">{role === 'admin' ? 'Smart Municipal' : 'CitizenConnect'}</h2>
      
      {role === 'admin' ? (
        <p className="admin-subtitle">Admin Portal</p>
      ) : (
        <div className="user-info">
          <div className="avatar">👤</div>
          <div>
            <strong>Welcome, Citizen</strong>
            <p>ID-99372-XM</p>
          </div>
        </div>
      )}

      <nav className="nav-menu">
        <ul>
          {menus.map((menu, index) => (
            <li key={index} className={activeMenu === menu ? 'active' : ''}>
              {menu}
            </li>
          ))}
        </ul>
      </nav>

      {role === 'citizen' && (
        <button className="emergency-btn">Emergency Contact</button>
      )}
    </aside>
  );
};

export default Sidebar;