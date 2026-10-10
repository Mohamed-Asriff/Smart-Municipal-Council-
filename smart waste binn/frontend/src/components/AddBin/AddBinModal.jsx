import React, { useState } from 'react';
import { createBin } from '../../services/api';
import './AddBinModal.css';

const ZONES = ['Town Center', 'Beach Side', 'Hospital Area', 'Mosque Area', 'School Zone', 'Station Area', 'North Zone'];

const AddBinModal = ({ onClose, onBinAdded }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    latitude: '',
    longitude: '',
    zone: 'Town Center',
    binHeightCm: 40
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!formData.id.trim()) return 'Bin ID is required';
    if (!formData.name.trim()) return 'Bin Name is required';
    
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) return 'Valid GPS coordinates are required';
    if (lat < 7.39 || lat > 7.43) return 'Latitude must be within Kalmunai area (7.39 - 7.43)';
    if (lng < 81.81 || lng > 81.84) return 'Longitude must be within Kalmunai area (81.81 - 81.84)';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      await createBin({
        id: formData.id.trim(),
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        zone: formData.zone,
        binHeightCm: parseFloat(formData.binHeightCm) || 40
      });
      setSuccess('Bin registered successfully!');
      if (onBinAdded) onBinAdded();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to register bin. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-bin-overlay animate-fade-in" onClick={onClose}>
      <div className="add-bin-modal glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="add-bin-header">
          <h2>➕ Add New Bin</h2>
          <button className="add-bin-close" onClick={onClose}>&times;</button>
        </div>

        <form className="add-bin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Bin ID</label>
              <input
                type="text"
                name="id"
                placeholder="e.g. BIN-011"
                value={formData.id}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Zone</label>
              <select name="zone" value={formData.zone} onChange={handleChange}>
                {ZONES.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Bin Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. New Street Corner Bin"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                name="latitude"
                step="0.0001"
                placeholder="e.g. 7.4150"
                value={formData.latitude}
                onChange={handleChange}
              />
              <span className="coord-hint">Range: 7.39 – 7.43</span>
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                name="longitude"
                step="0.0001"
                placeholder="e.g. 81.8200"
                value={formData.longitude}
                onChange={handleChange}
              />
              <span className="coord-hint">Range: 81.81 – 81.84</span>
            </div>
          </div>

          <div className="form-group">
            <label>Bin Height (cm)</label>
            <input
              type="number"
              name="binHeightCm"
              step="0.1"
              placeholder="40"
              value={formData.binHeightCm}
              onChange={handleChange}
            />
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBinModal;
