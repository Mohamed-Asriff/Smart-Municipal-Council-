import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import AdminComplaints from '../features/complaints/AdminComplaints';
import WasteDashboard from '../features/waste/WasteDashboard';
import AdminPayments from '../features/payments/AdminPayments';
import AdminNews from '../features/announcements/AdminNews';
import AdminNotices from '../features/announcements/AdminNotices';
import AdminUsers from '../features/users/AdminUsers';
import { useAuth } from '../context/AuthContext';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('kmc_admin_tab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('kmc_admin_tab', activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('kmc_admin_tab'); 
    localStorage.removeItem('kmc_citizen_tab');
    localStorage.removeItem('kmc_active_view');
    logout();
  };

  return (
    <AdminLayout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} />}
      {activeTab === 'complaints' && <AdminComplaints />}
      {activeTab === 'wastebins' && <WasteDashboard />}
      {activeTab === 'payments' && <AdminPayments />}
      {activeTab === 'news' && <AdminNews />}
      {activeTab === 'notices' && <AdminNotices />}
      {activeTab === 'users' && <AdminUsers />}
    </AdminLayout>
  );
}