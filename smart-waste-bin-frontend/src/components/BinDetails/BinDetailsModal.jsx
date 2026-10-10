import React, { useState } from 'react';
import FillLevelChart from '../Charts/FillLevelChart';
import { getFillColor, getFillStatus, formatDateTime } from '../../utils/helpers';
import { deleteBin } from '../../services/api';
import './BinDetailsModal.css';

const BinDetailsModal = ({ bin, onClose, onBinDeleted }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fill = bin.latestFillPercentage != null ? bin.latestFillPercentage : 0;
  const color = getFillColor(fill);
  const status = getFillStatus(fill);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBin(bin.id);
      setShowConfirm(false);
      onClose();
      if (onBinDeleted) {
        onBinDeleted();
      }
    } catch (error) {
      console.error('Error deleting bin:', error);
      setDeleteError('Failed to delete bin. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{bin.name}</h2>
            <span className="modal-bin-id">ID: {bin.id}</span>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="status-badge" style={{ backgroundColor: color }}>
            {status}
          </div>
          
          <div className="modal-info-grid">
            <div className="info-item">
              <span className="info-label">Zone</span>
              <span className="info-value">{bin.zone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Coordinates</span>
              <span className="info-value">{bin.latitude?.toFixed(4)}, {bin.longitude?.toFixed(4)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{formatDateTime(bin.lastUpdated)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Distance</span>
              <span className="info-value">{bin.latestDistanceCm != null ? `${Number(bin.latestDistanceCm).toFixed(1)} cm` : 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Device Status</span>
              <span className="info-value" style={{ color: (bin.status || 'ACTIVE') === 'ACTIVE' ? 'var(--status-green)' : 'var(--status-orange)' }}>
                {bin.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          <div className="fill-display">
            <div className="fill-circle" style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}>
              <span className="fill-percentage" style={{ color }}>{Math.round(fill)}%</span>
              <span className="fill-label">Current Fill</span>
            </div>
          </div>

          <div className="chart-container">
            <h3>Fill Level History (Last 24h)</h3>
            <FillLevelChart binId={bin.id} />
          </div>

          <div className="delete-section">
            <button className="delete-bin-btn" onClick={() => setShowConfirm(true)}>
              🗑️ Delete Bin
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => !isDeleting && setShowConfirm(false)}>
          <div className="confirm-dialog animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Delete Bin</h3>
            <p>Are you sure you want to delete <strong>{bin.name}</strong> ({bin.id})?</p>
            <p className="confirm-warning">This action cannot be undone. All data associated with this bin will be permanently removed.</p>
            {deleteError && <p className="confirm-error">{deleteError}</p>}
            <div className="confirm-actions">
              <button 
                className="confirm-cancel-btn" 
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinDetailsModal;
