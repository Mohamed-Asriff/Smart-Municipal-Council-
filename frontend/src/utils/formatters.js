export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'RESOLVED': return 'badge-success';
    case 'IN_PROGRESS': return 'badge-warning';
    case 'REJECTED': return 'badge-danger';
    default: return 'badge-info';
  }
};