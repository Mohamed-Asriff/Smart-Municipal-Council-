const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('kmc_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  login: async (credentials) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!res.ok) throw new Error('Login failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error('Registration failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  getComplaints: async () => {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Complaints fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },  
  getComplaintByTicket: async (ticketCode) => {
    try {
      const res = await fetch(`${BASE_URL}/complaints/track/${ticketCode}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createComplaint: async (complaint) => {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(complaint)
      });
      if (!res.ok) throw new Error('Complaint submission failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  getPayments: async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Payments fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  submitPayment: async (paymentPayload) => {
    try {
      const res = await fetch(`${BASE_URL}/payments/checkout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentPayload)
      });
      if (!res.ok) throw new Error('Payment processing failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  // ---- ADMIN: NEWS ----
  adminCreateNews: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/news`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Create news failed');
      return await res.json();
    } catch { return null; }
  },
  adminDeleteNews: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/news/${id}`, { method: 'DELETE', headers: getHeaders() });
      return res.ok;
    } catch { return false; }
  },

  // ---- ADMIN: NOTICES ----
  adminCreateNotice: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/notices`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Create notice failed');
      return await res.json();
    } catch { return null; }
  },
  adminDeleteNotice: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/notices/${id}`, { method: 'DELETE', headers: getHeaders() });
      return res.ok;
    } catch { return false; }
  },

  // ---- ADMIN: COMPLAINTS ----
  adminGetAllComplaints: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/complaints`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch { return []; }
  },
  adminUpdateComplaint: async (id, payload) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/complaints/${id}/status`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Update failed');
      return await res.json();
    } catch { return null; }
  },
  adminGetAllUsers: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch { return []; }
  },
};