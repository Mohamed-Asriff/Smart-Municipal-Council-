// Utility functions for session management and message formatting in the chatbot UI

export const generateSessionId = () => {
  return 'kmc_session_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
};

export const formatTime = (date = new Date()) => {
  return new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(date);
};

export const getStoredSessionId = () => {
  let sessionId = localStorage.getItem("kmc_chat_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("kmc_chat_session_id", sessionId);
  }
  return sessionId;
};
