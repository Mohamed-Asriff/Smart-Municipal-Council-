// API Client configuration for Spring Boot + PostgreSQL backend
// Configurable via VITE_API_BASE_URL (defaults to Spring Boot default: http://localhost:8080/api)
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

  getProfile: async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Profile fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error('Update profile failed');
      return await res.json();
    } catch {
      return null;
    }
  }
}

  getComplaints: async () => {
    try {
      const res = await fetch(`${BASE_URL}/complaints`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Complaints fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  createComplaint; async (complaint) => {
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

  getPayments; async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Payments fetch failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  submitPayment; async (paymentPayload) => {
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
  }

