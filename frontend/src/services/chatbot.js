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
    if (q.includes('waste') || q.includes('குப்பை') || q.includes('கழிவு')) {
      return 'குப்பை சேகரிப்பு அட்டவணை: திங்கள், புதன், வெள்ளி (குடியிருப்புப் பகுதிகள்), செவ்வாய், வியாழன், சனி (வர்த்தகப் பகுதிகள்).';
    }
    if (q.includes('water') || q.includes('தண்ணீர்') || q.includes('நீர்')) {
      return 'குடிநீர் அல்லது குழாய் கசிவு பிரச்சனைகளைத் தெரிவிக்க 067-2220263 எண்ணை அழைக்கவும் அல்லது தளத்தில் முறைப்பாடு செய்யவும்.';
    }
    if (q.includes('light') || q.includes('விளக்கு')) {
      return 'தெரு விளக்கு பழுதுகளைத் தெரிவிக்க முறைப்பாடு பதிவு செய்யவும் அல்லது 067-2220261 எண்ணை அழைக்கவும்.';
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
    if (q.includes('waste') || q.includes('කසළ')) {
      return 'කසළ එකතු කිරීම: සඳුදා, බදාදා, සිකුරාදා (නේවාසික ප්‍රදේශ) සහ අඟහරුවාදා, බ්‍රහස්පතින්දා, සෙනසුරාදා (ව්‍යාපාරික ප්‍රදේශ).';
    }
    if (q.includes('water') || q.includes('ජල')) {
      return 'ජල නල කාන්දු වාර්තා කිරීමට නගර සභාවේ ජල අංශය අමතන්න: 067-2220263.';
    }
    if (q.includes('light') || q.includes('විදුලි')) {
      return 'වීදි ලාම්පු අක්‍රියතා වාර්තා කිරීමට පැමිණිල්ලක් ඉදිරිපත් කරන්න හෝ 067-2220261 අමතන්න.';
    }
    return 'කල්මුණේ නගර සභා AI සහකරු ඔබට උදවු කිරීමට සූදානම්. පැමිණිලි, බදු, කසළ කළමනාකරණය ගැන අසන්න. හදිසි ඇමතුම්: 1990.';
  }

  // English fallback
  if (q.includes('light') || q.includes('lamp') || q.includes('streetlight')) {
    return 'To report a broken or flickering street light, click **File Complaint** and select **Street Lighting & Electricity**, or call the electrical desk at **067-2220261**. Providing the pole number or road name will help resolve it faster.';
  }
  if (q.includes('track') || q.includes('status')) {
    return 'To track your complaint, go to the **Track Complaint** section on the home page or portal, enter your Ticket Reference ID (e.g. `KMC-2026-XXXX`), and view the real-time status and assigned officer.';
  }
  if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('office')) {
    return '🏢 **Kalmunai Municipal Council Office Hours:**\n• Monday to Friday: **8:30 AM – 4:15 PM**\n• Saturday, Sunday & Public Holidays: **Closed**\n• Location: Main Street, Kalmunai.';
  }
  if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('number')) {
    return '📞 **Kalmunai Municipal Council Contacts:**\n• General Inquiries / Hotline: **067-2220261**\n• Water & Drainage Division: **067-2220263**\n• Disaster Response Unit: **067-2229999**\n• Medical Emergency (Suwa Seriya): **1990**';
  }
  if (q.includes('complaint') || q.includes('report') || q.includes('issue')) {
    return 'To file a complaint, click **File Complaint** on the home page or citizen portal, or call the KMC hotline at **067-2220261**. You will immediately receive a tracking ticket code like `KMC-2026-XXXX` to monitor progress.';
  }
  if (q.includes('tax') || q.includes('pay') || q.includes('bill') || q.includes('assessment')) {
    return 'To pay your municipal property assessment taxes, log in to the **Citizen Portal → Payments**, select your pending bill, and complete the secure online payment via PayHere (supporting Visa, MasterCard, and LankaQR).';
  }
  if (q.includes('waste') || q.includes('garbage') || q.includes('bin') || q.includes('trash') || q.includes('collection')) {
    return 'Garbage collection runs **Mon / Wed / Fri** for residential wards and **Tue / Thu / Sat** for commercial zones. KMC also monitors smart IoT bins across Kalmunai in real-time. If you spot an overflowing bin, you can report it via the portal.';
  }
  if (q.includes('water') || q.includes('pipe') || q.includes('leak') || q.includes('drain')) {
    return 'To report a water pipe leak or blocked drain, please file a ticket under **Water & Sewerage** on the portal, or contact the municipal emergency team at **067-2220263**. For life emergencies call **1990**.';
  }
  if (q.includes('emergency') || q.includes('urgent') || q.includes('fire') || q.includes('police')) {
    return '🚨 **Emergency Contacts:**\n• Ambulance (Suwa Seriya): **1990**\n• Police Emergency: **119**\n• Fire Brigade: **110**\n• KMC Disaster Management: **067-2229999**';
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('morning') || q.includes('evening')) {
    return 'Hello! 👋 Welcome to the Kalmunai Municipal Council Assistant. I can help answer questions regarding complaints, property taxes, waste collection, water services, and municipal departments. How may I assist you today?';
  }

  return 'I am the Kalmunai Municipal Council Assistant. I can assist you with complaints, property tax payments, waste collection schedules, water issues, and council services. For immediate assistance, feel free to call our hotline at **067-2220261** or **1990** for medical emergencies.';
}
