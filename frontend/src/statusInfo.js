export const STATUS = {
  PENDING: { label: 'Pending', cls: 'pending' },
  IN_PROGRESS: { label: 'In Progress', cls: 'inprogress' },
  RESOLVED: { label: 'Resolved', cls: 'resolved' },
  REJECTED: { label: 'Rejected', cls: 'rejected' },
}

export const CATEGORY = {
  STREETLIGHT: 'Streetlight',
  WASTE_MANAGEMENT: 'Waste Management',
  ROADS_DRAINAGE: 'Roads and Drainage',
  WATER_SUPPLY: 'Water Supply',
  OTHER: 'Other',
}

export const DEPARTMENT = {
  ELECTRICAL: 'Electrical Division',
  SANITATION: 'Sanitation and Waste',
  CIVIL_WORKS: 'Civil Works Unit',
  WATER_SERVICES: 'Water Services',
}

export const PRIORITY = {
  LOW: { label: 'Low', cls: 'p-low' },
  MEDIUM: { label: 'Medium', cls: 'p-medium' },
  HIGH: { label: 'High', cls: 'p-high' },
  URGENT: { label: 'Urgent', cls: 'p-urgent' },
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}