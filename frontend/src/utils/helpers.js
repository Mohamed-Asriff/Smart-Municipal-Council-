export const getFillColor = (percentage) => {
  if (percentage < 50) return '#00d4aa';
  if (percentage < 70) return '#ffc107';
  if (percentage < 85) return '#ff9800';
  return '#f44336';
};

export const getFillColorVar = (percentage) => {
  if (percentage < 50) return 'var(--status-green)';
  if (percentage < 70) return 'var(--status-yellow)';
  if (percentage < 85) return 'var(--status-orange)';
  return 'var(--status-red)';
};

export const getFillStatus = (percentage) => {
  if (percentage < 50) return 'Normal';
  if (percentage < 70) return 'Warning';
  if (percentage < 85) return 'High';
  return 'Critical';
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatPercentage = (value) => {
  if (value == null) return '0.0%';
  return `${Number(value).toFixed(1)}%`;
};
