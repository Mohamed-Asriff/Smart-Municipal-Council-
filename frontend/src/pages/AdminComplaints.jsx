import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import './AdminComplaints.css';

const API_BASE = '/api/complaints';

export default function AdminComplaints() {
  const [activeMenu, setActiveMenu] = useState('Manage Complaints');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await fetch(`${API_BASE}/all`);
        if (!response.ok) throw new Error('Failed to load complaints');
        const data = await response.json();

        const transformed = data.map((item) => ({
          id: `KMC-${item.id}`,
          citizen: `Citizen ID-${item.citizenId}`,
          category: item.category,
          date: new Date(item.createdAt).toLocaleString(),
          status: item.status,
          location: item.location,
          assignedDept: item.departmentName || 'Unassigned',
          description: item.description,
          rawId: item.id,
        }));

        setComplaints(transformed);
      } catch (error) {
        console.error('Load complaints error:', error);
      }
    };

    loadComplaints();
  }, []);

  const handleAssignDept = async (rawId, newDept) => {
    try {
      const response = await fetch(`${API_BASE}/${rawId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentName: newDept }),
      });

      if (!response.ok) throw new Error('Failed to assign department');

      const updated = await response.json();
      setComplaints(prev =>
        prev.map(item => item.rawId === updated.id ? {
          ...item,
          assignedDept: updated.departmentName,
          status: updated.status,
          date: new Date(updated.updatedAt || updated.createdAt).toLocaleString(),
        } : item)
      );

      if (selectedComplaint && selectedComplaint.rawId === updated.id) {
        setSelectedComplaint(prev => ({ ...prev, assignedDept: updated.departmentName, status: updated.status }));
      }
    } catch (error) {
      console.error('Assign department error:', error);
    }
  };

  const handleStatusChange = async (rawId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/${rawId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNotes: newStatus === 'Resolved' ? 'Updated by admin' : 'In progress' }),
      });

      if (!response.ok) throw new Error('Failed to update complaint status');

      const updated = await response.json();
      setComplaints(prev =>
        prev.map(item => item.rawId === updated.id ? {
          ...item,
          status: updated.status,
          date: new Date(updated.updatedAt || updated.createdAt).toLocaleString(),
        } : item)
      );

      if (selectedComplaint && selectedComplaint.rawId === updated.id) {
        setSelectedComplaint(prev => ({ ...prev, status: updated.status }));
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  return (
    <div className="page-wrapper">
      <Header role="admin" />

      <div className="layout-body">
        <Sidebar 
          role="admin" 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
        />

        <main className="main-content">
          <div className="card-header-section">
            <h1 className="card-title">Complaint Administration & Oversight</h1>
            <p className="card-subtitle">
              Monitor municipal complaints, delegate tasks to departments, and review detailed reports.
            </p>
          </div>

          <div className="admin-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Total Complaints</span>
              <h2 className="metric-value">142</h2>
            </div>
            <div className="metric-box">
              <span className="metric-label">Pending Review</span>
              <h2 className="metric-value pending">18</h2>
            </div>
            <div className="metric-box">
              <span className="metric-label">Resolution Rate</span>
              <h2 className="metric-value success">87.3%</h2>
            </div>
          </div>

          <div className="table-wrapper-card">
            <div className="table-header-bar">
              <h2 className="section-title">Central Complaint Ledger</h2>
              <div className="table-actions">
                <input 
                  type="text" 
                  placeholder="Search Ticket ID or Citizen..." 
                  className="table-search-input"
                />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)} 
                  className="table-filter-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <table className="admin-ledger-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Ticket ID</th>
                  <th>Citizen Details</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Assigned Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints
                  .filter(c => filterStatus === 'All' || c.status === filterStatus)
                  .map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td><strong className="ticket-link">#{item.id}</strong></td>
                      <td>{item.citizen}</td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td>
                        <select 
                          className="dept-assign-select"
                          value={item.assignedDept}
                          onChange={(e) => handleAssignDept(item.rawId, e.target.value)}
                        >
                          <option value="Unassigned">⚠️ Select Department</option>
                          <option value="Electrical Division">⚡ Electrical Division</option>
                          <option value="Sanitation & Waste">🧹 Sanitation & Waste</option>
                          <option value="Civil Works Unit">🏗️ Civil Works Unit</option>
                          <option value="Water Services">💧 Water Services</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-pill ${item.status.toLowerCase().replace(' ', '-')}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className="btn-action-view"
                          onClick={() => {
                            console.log("Viewing complaint:", item.id);
                            setSelectedComplaint(item);
                          }}
                        >
                          [View Details]
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedComplaint(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div 
            className="modal-container" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
          >
            <div className="modal-header">
              <h3>Complaint Details #{selectedComplaint.id}</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-grid-row">
                <div>
                  <label className="modal-label">Citizen Name & ID</label>
                  <p className="modal-text">{selectedComplaint.citizen}</p>
                </div>
                <div>
                  <label className="modal-label">Submission Date & Time</label>
                  <p className="modal-text">{selectedComplaint.date}</p>
                </div>
              </div>

              <div className="modal-grid-row">
                <div>
                  <label className="modal-label">Category</label>
                  <p className="modal-text">{selectedComplaint.category}</p>
                </div>
                <div>
                  <label className="modal-label">Location / Ward</label>
                  <p className="modal-text">{selectedComplaint.location}</p>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Issue Description</label>
                <div className="modal-description-box">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="modal-grid-row controls-row">
                <div>
                  <label className="modal-label">Assigned Department</label>
                  <select 
                    className="dept-assign-select full-width"
                    value={selectedComplaint.assignedDept}
                    onChange={(e) => handleAssignDept(selectedComplaint.rawId, e.target.value)}
                  >
                    <option value="Unassigned">⚠️ Select Department</option>
                    <option value="Electrical Division">⚡ Electrical Division</option>
                    <option value="Sanitation & Waste">🧹 Sanitation & Waste</option>
                    <option value="Civil Works Unit">🏗️ Civil Works Unit</option>
                    <option value="Water Services">💧 Water Services</option>
                  </select>
                </div>

                <div>
                  <label className="modal-label">Ticket Status</label>
                  <select 
                    className="table-filter-select full-width"
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusChange(selectedComplaint.rawId, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '16px', textAlign: 'right' }}>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => setSelectedComplaint(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}