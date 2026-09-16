import { useState } from 'react';
import ComplaintPage from './pages/ComplaintPage.jsx';
import AdminComplaints from './pages/AdminComplaints.jsx';
import './App.css';

export default function App() {
  const [viewMode, setViewMode] = useState('citizen');

  return (
    <div className="app-container">
      <div className="top-view-switcher">
        <button 
          type="button"
          className={`switcher-btn ${viewMode === 'citizen' ? 'active' : ''}`}
          onClick={() => setViewMode('citizen')}
        >
          View Citizen UI
        </button>
        <button 
          type="button"
          className={`switcher-btn ${viewMode === 'admin' ? 'active' : ''}`}
          onClick={() => setViewMode('admin')}
        >
          View Admin UI
        </button>
      </div>

      <div className="view-content">
        {viewMode === 'citizen' ? <ComplaintPage /> : <AdminComplaints />}
      </div>
    </div>
  );
}