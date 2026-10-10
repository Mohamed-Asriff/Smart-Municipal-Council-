import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000
});

export const sendChatMessage = async (message, sessionId = "default", history = []) => {
  const response = await apiClient.post("/chat", {
    message,
    session_id: sessionId,
    history
  });
  return response.data;
};

export const predictPriority = async (complaintText) => {
  const response = await apiClient.post("/predict-priority", {
    complaint: complaintText
  });
  return response.data;
};

export const predictCategory = async (complaintText) => {
  const response = await apiClient.post("/predict-category", {
    complaint: complaintText
  });
  return response.data;
};

export const checkDuplicate = async (complaintText) => {
  const response = await apiClient.post("/check-duplicate", {
    complaint: complaintText
  });
  return response.data;
};

export const analyzeComplaint = async (complaintText) => {
  const response = await apiClient.post("/analyze-complaint", {
    complaint: complaintText
  });
  return response.data;
};

export const submitComplaint = async (data) => {
  const response = await apiClient.post("/complaints", data);
  return response.data;
};

export const getComplaints = async (params = {}) => {
  const response = await apiClient.get("/complaints", { params });
  return response.data;
};

export const getComplaintByTrackingId = async (trackingId) => {
  const response = await apiClient.get(`/complaints/${encodeURIComponent(trackingId)}`);
  return response.data;
};

export const updateComplaintStatus = async (trackingId, status) => {
  const response = await apiClient.patch(`/complaints/${encodeURIComponent(trackingId)}/status`, {
    status
  });
  return response.data;
};

export default apiClient;
