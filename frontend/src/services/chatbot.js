// ============================================================================
// KMC AI CHATBOT SERVICE — Centralized helpers for the Chatbot widget
// ============================================================================

import { api } from '../api';

/**
 * Persistent session ID for the AI assistant (stored in localStorage).
 */
export const getStoredSessionId = () => {
  let id = localStorage.getItem('kmc_ai_session_id');
  if (!id) {
    id = 'session_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('kmc_ai_session_id', id);
  }
  return id;
};

/**
 * Simple time formatter for chat message bubbles.
 */
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Sends a message to the KMC AI Assistant backend (FastAPI microservice).
 * Falls back to a friendly local response if the service is unreachable.
 *
 * @param {string} message     - The user's message.
 * @param {string} sessionId   - Persistent conversation ID.
 * @param {Array}  history     - Previous messages [{ role, content }].
 * @param {string} lang        - 'en' | 'ta' | 'si'.
 * @returns {Promise<{ reply: string }>}
 */
export const sendChatMessage = async (message, sessionId = 'default', history = [], lang = 'en') => {
  try {
    const data = await api.chat(message, sessionId, history, lang);
    const reply = data?.reply || data?.response;
    if (reply) return { reply };
  } catch (err) {
    console.warn('[CHATBOT] AI service unreachable, using local fallback.', err);
  }

  // Local fallback — intelligently guesses based on keywords
  return { reply: getLocalFallbackReply(message, lang) };
};

/**
 * Multilingual keyword-based fallback when the AI service is offline.
 */
function getLocalFallbackReply(message, lang = 'en') {
  const q = (message || '').toLowerCase();

  if (lang === 'ta') {
    if (q.includes('complaint') || q.includes('முறை')) {
      return 'புதிய முறையீட்டைப் பதிவு செய்ய, முகப்பு பக்கத்தில் "File Complaint" என்பதை கிளிக் செய்யவும் அல்லது கல்முனை மாநகர சபையை 067-2220261 எண்ணில் அழைக்கவும்.';
    }
    if (q.includes('tax') || q.includes('வரி')) {
      return 'சொத்து வரியை செலுத்த, Citizen Portal → Payments பகுதிக்குச் செல்லவும். PayHere மூலம் Visa, MasterCard, LankaQR ஆகியவை ஏற்கப்படும்.';
    }
    return 'கல்முனை மாநகர சபை AI உதவியாளர் உங்களுக்கு உதவத் தயார். முறையீடுகள், வரிகள், கழிவகற்றல் பற்றி கேட்கலாம். அவசர உதவிக்கு 1990 என்ற எண்ணை அழைக்கவும்.';
  }

  if (lang === 'si') {
    if (q.includes('complaint') || q.includes('පැමිණිලි')) {
      return 'නව පැමිණිල්ලක් ඉදිරිපත් කිරීමට, ප්‍රධාන පිටුවේ "File Complaint" ක්ලික් කරන්න හෝ නගර සභාව අමතන්න: 067-2220261.';
    }
    if (q.includes('tax') || q.includes('බදු')) {
      return 'වරිපනම් බදු ගෙවීමට, Citizen Portal → Payments වෙත යන්න. PayHere හරහා Visa, MasterCard, LankaQR භාරගනු ලැබේ.';
    }
    return 'කල්මුණේ නගර සභා AI සහකරු ඔබට උදවු කිරීමට සූදානම්. පැමිණිලි, බදු, කසළ කළමනාකරණය ගැන අසන්න. හදිසි ඇමතුම්: 1990.';
  }

  // English fallback
  if (q.includes('complaint') || q.includes('report')) {
    return 'To file a complaint, click **File Complaint** on the home page, or call the KMC hotline at **067-2220261**. You will receive a tracking code like KMC-2026-XXXX to monitor progress.';
  }
  if (q.includes('tax') || q.includes('pay') || q.includes('bill')) {
    return 'To pay your municipal taxes, log in to the **Citizen Portal → Payments**, select your pending bill, and complete the secure checkout via PayHere (Visa, MasterCard, LankaQR).';
  }
  if (q.includes('waste') || q.includes('garbage') || q.includes('bin')) {
    return 'Garbage collection runs **Mon/Wed/Fri** for residential wards and **Tue/Thu/Sat** for commercial zones. KMC operates 10 IoT smart bins across the city — report an overflow via the portal.';
  }
  if (q.includes('water') || q.includes('leak') || q.includes('drain')) {
    return 'To report a water leak or blocked drain, file a complaint under **Water & Sewerage** on the portal, or call **067-2220263**. Emergency: **1990**.';
  }
  if (q.includes('emergency') || q.includes('urgent')) {
    return '🚨 Emergency numbers:\n• Ambulance (Suwa Seriya): **1990**\n• Police: **119**\n• Fire: **110**\n• KMC Disaster Cell: **067-2229999**';
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Hello! 👋 I\'m the KMC AI Assistant. I can help you with complaints, payments, waste collection, water services, and council information. How may I assist you today?';
  }

  return 'I\'m the Kalmunai Municipal Council AI Assistant. I can help with complaints, tax payments, waste collection, water issues, and council contacts. For urgent matters, call **067-2220261** or **1990** for emergencies.';
}
