// ============================================================================
// KMC — Single API surface. Every component imports from here.
// ============================================================================
import { get, post, put, patch, del } from './client';

export const api = {
  // AUTH
  login:          (creds) => post('/auth/login', creds, { public: true }),
  register:       (data)  => post('/auth/register', data, { public: true }),
  forgotPassword: (id)    => post('/auth/forgot-password', { identifier: id }, { public: true }),
  resetPassword:  (data)  => post('/auth/reset-password', data, { public: true }),
  getMe:          ()      => get('/auth/me'),
  updateProfile:  (data)  => put('/auth/profile', data),

  // COMPLAINTS (citizen)
  getComplaints: () => get('/complaints'),
  
  getComplaintByTicket: async (code) => {
    try {
      return await get(`/complaints/track/${encodeURIComponent(code)}`, { public: true });
    } catch (err) {
      // 404 or 500 means "ticket not found" — don't crash the UI
      if (err.status === 404 || err.status === 500) {
        return null; 
      }
      throw err;
    }
  },

  createComplaint: (data, file = null) => {
    if (file) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
      fd.append('file', file);
      return post('/complaints', fd);
    }
    return post('/complaints', data);
  },

  // COMPLAINTS (admin)
  adminGetAllComplaints:  (params = {}) => get('/admin/complaints', { query: params }),
  adminSearchComplaints:  (params = {}) => get('/admin/complaints/search', { query: params }),
  adminGetStats:          ()            => get('/admin/complaints/stats'),
  adminGetComplaint:      (id)          => get(`/admin/complaints/${id}`),
  adminUpdateComplaint:   (id, data)    => put(`/admin/complaints/${id}/status`, data),
  adminAssignComplaint:   (id, data)    => patch(`/admin/complaints/${id}/assign`, data),

  // PAYMENTS
  getPayments:      ()                    => get('/payments'),
  initiatePayment:  (paymentId, billCode) => post('/payments/initiate', { paymentId, billCode }),
  submitPayment:    (data)                => post('/payments/checkout', data),
  getPaymentStatus: (id)                  => get(`/payments/${id}/status`),
  submitManualPayment: (data) => post('/payments/manual-checkout', data),

  // PAYMENTS (admin)
  adminGetAllPayments: ()     => get('/admin/payments'),
  adminGetPaymentKpis: ()     => get('/admin/payments/kpis'),
  adminIssueBill:      (data) => post('/admin/payments/issue', data),
  adminUpdatePaymentStatus: (id, status) => put(`/admin/payments/${id}/status`, { status }),

  // NEWS + NOTICES
  getNews:    () => get('/news', { public: true }),
  getNotices: () => get('/notices', { public: true }),

  // USERS (admin)
  adminGetUsers: () => get('/admin/users'),

  // WASTE / BINS
  getBins:       ()               => get('/bins', { public: true }),
  getBinById:    (id)             => get(`/bins/${id}`, { public: true }),
  getBinHistory: (id, hours = 24) => get(`/bins/${id}/history`, { query: { hours }, public: true }),
  getWasteStats: ()               => get('/waste-dashboard/stats', { public: true }),
  createBin:     (data)           => post('/bins', data),
  deleteBin:     (id)             => del(`/bins/${id}`),

  // AI
  chat:            (message, sessionId = 'default', history = [], lang = 'en') =>
    post('/chat', { message, session_id: sessionId, history, lang }, { ai: true, public: true }),
  
  // Kept for Chatbot backward compatibility
  sendChatMessage: (message, sessionId, history, lang) =>
    post('/chat', { message, session_id: sessionId, history, lang }, { ai: true, public: true }),

  predictPriority: (complaint) => post('/predict-priority',  { complaint }, { ai: true, public: true }),
  predictCategory: (complaint) => post('/predict-category',  { complaint }, { ai: true, public: true }),
  checkDuplicate:  (complaint) => post('/check-duplicate',   { complaint }, { ai: true, public: true }),
  analyzeComplaint:(complaint) => post('/analyze-complaint', { complaint }, { ai: true, public: true }),
};