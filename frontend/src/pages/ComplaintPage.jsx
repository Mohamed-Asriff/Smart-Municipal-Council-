import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/Header/Header.jsx';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import './ComplaintPage.css';
import kalmunaiMapAsset from '../assets/Kalmunai.png';

const API_BASE = '/api/complaints';

export default function ComplaintPage() {
  const [activeTab, setActiveTab] = useState('submit');
  const [activeMenu, setActiveMenu] = useState('Complaints');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // Photo Upload States & Reference
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [searchTicket, setSearchTicket] = useState('');
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadCitizenHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/citizen/1`);
        if (!response.ok) {
          throw new Error('Failed to fetch complaint history');
        }
        const data = await response.json();
        setHistory(data);
        if (data.length > 0) {
          setTrackedTicket({
            id: `KMC-${data[0].id}`,
            title: data[0].description || 'Complaint',
            location: data[0].location,
            status: data[0].status,
          });
        }
      } catch (error) {
        console.error('History fetch error:', error);
      }
    };

    loadCitizenHistory();
  }, []);

  // Photo Handling Functions
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setPhotoFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category) {
      alert('Please fill out the Complaint Title and Category.');
      return;
    }

    try {
      const payload = {
        citizenId: 1,
        category,
        description: description || title,
        location: address || 'Not provided',
        imageUrl: '', // Can be updated when connecting to cloud storage or backend file uploads
      };

      const response = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Complaint submission failed');
      }

      const savedComplaint = await response.json();
      alert('Complaint submitted successfully!');
      
      // Reset form fields
      setTitle('');
      setCategory('');
      setAddress('');
      setDescription('');
      setPhotoFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTrackedTicket({
        id: `KMC-${savedComplaint.id}`,
        title: savedComplaint.description || 'Complaint',
        location: savedComplaint.location,
        status: savedComplaint.status,
      });

      const updatedHistory = await fetch(`${API_BASE}/citizen/1`).then((res) => res.json());
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit complaint. Please try again.');
    }
  };

  const handleTrackTicket = async () => {
    const query = searchTicket.trim();
    if (!query) {
      alert('Please enter a ticket number to track.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/all`);
      const complaints = await response.json();
      const found = complaints.find((item) => `KMC-${item.id}` === query || String(item.id) === query);

      if (!found) {
        alert('Ticket not found.');
        return;
      }

      setTrackedTicket({
        id: `KMC-${found.id}`,
        title: found.description || 'Complaint',
        location: found.location,
        status: found.status,
      });
    } catch (error) {
      console.error('Track ticket error:', error);
      alert('Could not track the complaint right now.');
    }
  };

  return (
    <div className="page-wrapper">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="layout-body">
        <Sidebar 
          role="citizen" 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
        />

        <main className="main-content">
          <div className="card-header-section">
            <h1 className="card-title">Complaint Center</h1>
            <p className="card-subtitle">
              Help us improve your city. Report issues and track their resolution in real-time.
            </p>
          </div>

          {activeTab === 'submit' && (
            <div className="tab-content">
              <h2 className="section-title">Submit New Complaint</h2>
              <div className="form-and-map-grid">
                <form onSubmit={handleSubmit} className="complaint-form">
                  <div className="form-group">
                    <label>Complaint Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Broken Streetlight" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category / Department</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="">Select Category</option>
                      <option value="Streetlight">Streetlight Maintenance</option>
                      <option value="Waste Management">Waste Management</option>
                      <option value="Roads">Roads & Drainage</option>
                      <option value="Water Supply">Water Supply</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location / Address</label>
                    <div className="location-input-row">
                      <input 
                        type="text" 
                        placeholder="Type address or ward" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                      <button type="button" className="btn-pin">📍 Pin Map</button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      rows="4" 
                      placeholder="Provide complete details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Functional Interactive Photo Upload Box */}
                  <div className="form-group">
                    <label>Upload Photo Evidence</label>
                    <div 
                      className="dropzone-box"
                      onClick={handleDropzoneClick}
                      style={{ cursor: 'pointer', textAlign: 'center', padding: '16px' }}
                    >
                      {previewUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={previewUrl} 
                            alt="Photo Evidence Preview" 
                            style={{ maxHeight: '120px', borderRadius: '6px', objectFit: 'cover' }} 
                          />
                          <span style={{ fontSize: '13px', color: '#4b5563' }}>{photoFile?.name}</span>
                          <button 
                            type="button" 
                            onClick={handleRemovePhoto}
                            style={{
                              marginTop: '4px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              color: '#dc2626',
                              backgroundColor: '#fee2e2',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove Photo
                          </button>
                        </div>
                      ) : (
                        <span>Click to select or drag photo here</span>
                      )}
                    </div>

                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handlePhotoChange} 
                      style={{ display: 'none' }} 
                    />
                  </div>

                  <button type="submit" className="btn-submit-blue">
                    Submit Complaint
                  </button>
                </form>

                <div className="map-container">
                  <img 
                    src={kalmunaiMapAsset} 
                    alt="Kalmunai Map" 
                    className="map-image"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://placehold.co/400x500/93c5fd/1e3a8a?text=Kalmunai+Map';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="tab-content">
              <h2 className="section-title">Track Complaint Status</h2>
              
              <div className="track-search-row">
                <input 
                  type="text" 
                  placeholder="e.g. KMC-2026-8492"
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                  className="track-input"
                />
                <button type="button" className="btn-track" onClick={handleTrackTicket}>Track Ticket</button>
              </div>

              {trackedTicket && (
                <div className="tracked-card">
                  <div className="tracked-card-info">
                    <span className="ticket-id-badge">{trackedTicket.id}</span>
                    <h3 className="tracked-title">{trackedTicket.title}</h3>
                    <p className="tracked-location">📍 {trackedTicket.location}</p>
                  </div>
                  <div className="status-pill-yellow">
                    {trackedTicket.status}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content">
              <h2 className="section-title">Submission History</h2>
              {history.length === 0 ? (
                <p className="no-records">No previous submissions found.</p>
              ) : (
                <div className="history-list">
                  {history.map((item) => (
                    <div key={item.id} className="tracked-card" style={{ marginBottom: '12px' }}>
                      <div className="tracked-card-info">
                        <span className="ticket-id-badge">KMC-{item.id}</span>
                        <h3 className="tracked-title">{item.description}</h3>
                        <p className="tracked-location">📍 {item.location}</p>
                      </div>
                      <div className="status-pill-yellow">{item.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}