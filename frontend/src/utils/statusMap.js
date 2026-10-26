// ============================================================================
// KMC — Single source of truth for status & priority values
// Every comparison, label, and badge in the app must go through here.
// ============================================================================

export const STATUS = Object.freeze({
  SUBMITTED:   'SUBMITTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DISPATCHED:  'DISPATCHED',
  RESOLVED:    'RESOLVED',
  REJECTED:    'REJECTED',
  CLOSED:      'CLOSED',
});

export const PRIORITY = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

/** Normalise any backend variant to a canonical status code. */
export function normalizeStatus(raw) {
  if (!raw) return STATUS.SUBMITTED;
  const key = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_');
  const map = {
    SUBMITTED: STATUS.SUBMITTED,
    SUBMITTED_TO_OFFICER: STATUS.SUBMITTED,
    PENDING: STATUS.SUBMITTED,
    RECORDED: STATUS.SUBMITTED,
    IN_PROGRESS: STATUS.IN_PROGRESS,
    INPROGRESS: STATUS.IN_PROGRESS,
    DISPATCHED: STATUS.DISPATCHED,
    DISPATCH: STATUS.DISPATCHED,
    RESOLVED: STATUS.RESOLVED,
    COMPLETED: STATUS.RESOLVED,
    REJECTED: STATUS.REJECTED,
    CLOSED: STATUS.CLOSED,
  };
  return map[key] || STATUS.SUBMITTED;
}

/** Normalise priority. */
export function normalizePriority(raw) {
  if (!raw) return PRIORITY.MEDIUM;
  const key = String(raw).trim().toUpperCase();
  return PRIORITY[key] || PRIORITY.MEDIUM;
}

/** Human-readable label. */
export function statusLabel(raw) {
  return {
    SUBMITTED:   'Submitted',
    IN_PROGRESS: 'In Progress',
    DISPATCHED:  'Dispatched',
    RESOLVED:    'Resolved',
    REJECTED:    'Rejected',
    CLOSED:      'Closed',
  }[normalizeStatus(raw)];
}

export function priorityLabel(raw) {
  return {
    LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
  }[normalizePriority(raw)];
}

/** Tailwind badge class for a status. */
export function statusBadgeClass(raw) {
  return {
    SUBMITTED:   'badge-info',
    IN_PROGRESS: 'badge-warning',
    DISPATCHED:  'badge-info',
    RESOLVED:    'badge-success',
    REJECTED:    'badge-danger',
    CLOSED:      'badge-neutral',
  }[normalizeStatus(raw)];
}

/** Tailwind badge class for a priority. */
export function priorityBadgeClass(raw) {
  return {
    LOW:      'badge-neutral',
    MEDIUM:   'badge-info',
    HIGH:     'badge-warning',
    CRITICAL: 'badge-danger',
  }[normalizePriority(raw)];
}

/** 4-step progress (1..4) derived from a status. */
export function statusProgress(raw) {
  const s = normalizeStatus(raw);
  if (s === STATUS.RESOLVED || s === STATUS.CLOSED) return 4;
  if (s === STATUS.IN_PROGRESS || s === STATUS.DISPATCHED) return 3;
  if (s === STATUS.REJECTED) return 2;
  return 1;
}

/** Categories (must match backend seed). */
export const CATEGORIES = [
  'Water', 'Waste', 'Road', 'Drainage',
  'Electrical', 'Public', 'Billing', 'Boat',
];