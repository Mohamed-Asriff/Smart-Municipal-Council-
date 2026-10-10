import React from 'react';
import './StatsBar.css';
import { formatPercentage } from '../../utils/helpers';

const StatsBar = ({ stats }) => {
  return (
    <div className="stats-bar animate-slide-up">
      <div className="stat-card glass-panel">
        <div className="stat-icon">🗑️</div>
        <div className="stat-info">
          <span className="stat-value">{stats.totalBins}</span>
          <span className="stat-label">Total Bins</span>
        </div>
      </div>
      <div className={`stat-card glass-panel ${stats.criticalBins > 0 ? 'critical-alert' : ''}`}>
        <div className="stat-icon">🚨</div>
        <div className="stat-info">
          <span className="stat-value">{stats.criticalBins}</span>
          <span className="stat-label">Critical Alerts</span>
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <span className="stat-value">{formatPercentage(stats.averageFillPercentage)}</span>
          <span className="stat-label">Average Fill</span>
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div className="stat-icon">📡</div>
        <div className="stat-info">
          <span className="stat-value">{stats.totalReadingsToday}</span>
          <span className="stat-label">Today's Readings</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
