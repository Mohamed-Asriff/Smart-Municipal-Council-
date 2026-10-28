import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, X, Send, Sparkles, FileText, CreditCard, Trash2, Droplets, 
  Minimize2, Maximize2, RotateCcw, Check, Copy, PhoneCall
} from 'lucide-react';
import { sendChatMessage, formatTime, getStoredSessionId } from '../../services/chatbot';
import { api } from '../../api';

// Multilingual Configuration
const MULTILINGUAL = {
  en: {
    title: 'KMC AI Assistant',
    status: 'Online • Official Municipal Service',
    welcome: 'How may Kalmunai Council assist you today?',
    placeholder: 'Ask about complaints, taxes, or waste management...',
    quick: [
      { icon: FileText, label: 'File Complaint', prompt: 'How do I submit a new complaint for a broken streetlight?', color: 'text-blue-600 bg-blue-50' },
      { icon: CreditCard, label: 'Pay Taxes', prompt: 'How can I pay my property assessment tax online?', color: 'text-kmc-gold bg-yellow-50' },
      { icon: Trash2, label: 'Waste Schedule', prompt: 'What is the garbage collection schedule in Kalmunai?', color: 'text-emerald-600 bg-emerald-50' },
      { icon: Droplets, label: 'Water Issues', prompt: 'How do I report a water pipe leak?', color: 'text-cyan-600 bg-cyan-50' },
    ],
    disclaimer: 'Official Municipal AI • Emergency: 1990 | KMC: 067-2220261'
  },
  ta: {
    title: 'KMC AI வழிகாட்டி',
    status: 'நேரலை • உத்தியோகபூர்வ சேவை',
    welcome: 'இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?',
    placeholder: 'முறைப்பாடுகள், வரிகள் பற்றி கேளுங்கள்...',
    quick: [
      { icon: FileText, label: 'முறைப்பாடு', prompt: 'புதிய முறையீட்டை எவ்வாறு பதிவு செய்வது?', color: 'text-blue-600 bg-blue-50' },
      { icon: CreditCard, label: 'வரி செலுத்த', prompt: 'சொத்து வரியை இணையத்தில் எவ்வாறு செலுத்துவது?', color: 'text-kmc-gold bg-yellow-50' },
      { icon: Trash2, label: 'கழிவு அட்டவணை', prompt: 'குப்பை சேகரிப்பு அட்டவணை என்ன?', color: 'text-emerald-600 bg-emerald-50' },
      { icon: Droplets, label: 'நீர் பிரச்சனை', prompt: 'குழாய் கசிவை எவ்வாறு தெரிவிப்பது?', color: 'text-cyan-600 bg-cyan-50' },
    ],
    disclaimer: 'அவசர உதவி: 1990 | KMC: 067-2220261'
  },
  si: {
    title: 'KMC AI සහකරු',
    status: 'සක්‍රීයයි • නිල නාගරික සේවය',
    welcome: 'අද ඔබට උදවු කළ හැක්කේ කෙසේද?',
    placeholder: 'පැමිණිලි, බදු ගැන අසන්න...',
    quick: [
      { icon: FileText, label: 'පැමිණිල්ලක්', prompt: 'නව පැමිණිල්ලක් ඉදිරිපත් කරන්නේ කෙසේද?', color: 'text-blue-600 bg-blue-50' },
      { icon: CreditCard, label: 'බදු ගෙවීම්', prompt: 'වරිපනම් බදු ගෙවන්නේ කෙසේද?', color: 'text-kmc-gold bg-yellow-50' },
      { icon: Trash2, label: 'කසළ කාලසටහන', prompt: 'කසළ එකතු කිරීමේ කාලසටහන මොකක්ද?', color: 'text-emerald-600 bg-emerald-50' },
      { icon: Droplets, label: 'ජල ගැටළු', prompt: 'ජල කාන්දුවක් වාර්තා කරන්නේ කෙසේද?', color: 'text-cyan-600 bg-cyan-50' },
    ],
    disclaimer: 'හදිසි ඇමතුම්: 1990 | KMC: 067-2220261'
  }
};

export default function Chatbot({ isOpen, onClose, lang = 'en', onOpenReport, onOpenPay }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(getStoredSessionId());

  // Safe fallback if lang prop is missing or invalid
  const t = MULTILINGUAL[lang] || MULTILINGUAL.en;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    sessionId.current = 'session_' + Math.random().toString(36).substring(2, 10);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: query, time: formatTime() }]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      
      const res = await api.sendChatMessage(query, sessionId.current, history, lang);
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: res.reply || 'Service temporarily unavailable. Please call 067-2220261.', 
        time: formatTime() 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Connection error. Please call the KMC hotline at 067-2220261.', 
        time: formatTime(), 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Convert markdown bold (**text**) and code blocks (`text`) to React nodes
  const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <p key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx} className="font-bold text-kmc-navy">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <span key={partIdx} className="inline-block bg-blue-50 border border-blue-200 text-kmc-blue font-mono text-xs font-bold px-1.5 py-0.5 rounded">
                  {part.slice(1, -1)}
                </span>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`fixed bottom-6 right-6 z-90 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom-5 ${
      isExpanded ? 'w-[95vw] sm:w-160 h-[85vh]' : 'w-[92vw] sm:w-100 h-155'
    }`}>
      
      {/* Header */}
      <div className="bg-kmc-navy p-4 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-kmc-gold/10 rounded-bl-full pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-kmc-gold border border-white/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-serif font-bold text-sm leading-tight">{t.title}</h3>
            <p className="text-[10px] text-kmc-gold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> {t.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          <button onClick={handleClearChat} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition" title="New Chat">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition hidden sm:block" title={isExpanded ? 'Minimize' : 'Expand'}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
        
        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300 py-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-3 text-kmc-blue">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-kmc-navy text-base">{t.welcome}</h4>
              <p className="text-xs text-slate-500 mt-1">Official automated citizen assistant.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {t.quick.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q.prompt)}
                  className="flex flex-col items-start p-3 bg-white rounded-xl border border-slate-200 hover:border-kmc-blue hover:shadow-sm transition text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${q.color}`}>
                    <q.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-kmc-navy group-hover:text-kmc-blue transition">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message History */}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}>
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-kmc-navy flex items-center justify-center text-kmc-gold shrink-0 mr-2 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm relative group ${
              m.sender === 'user' 
                ? 'bg-kmc-blue text-white rounded-br-sm' 
                : m.isError ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
            }`}>
              {renderText(m.text)}
              
              <div className="flex items-center justify-between mt-1.5 gap-2">
                <span className={`text-[9px] ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</span>
                {m.sender === 'bot' && (
                  <button onClick={() => handleCopy(m.text, i)} className="text-slate-300 hover:text-kmc-navy transition opacity-0 group-hover:opacity-100">
                    {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Action Shortcuts */}
              {m.sender === 'bot' && !m.isError && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  {onOpenReport && m.text.toLowerCase().includes('complaint') && (
                    <button onClick={onOpenReport} className="text-[10px] font-bold text-kmc-blue bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> File Complaint
                    </button>
                  )}
                  {onOpenPay && m.text.toLowerCase().includes('tax') && (
                    <button onClick={() => onOpenPay()} className="text-[10px] font-bold text-kmc-navy bg-yellow-50 px-2 py-1 rounded hover:bg-yellow-100 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Pay Now
                    </button>
                  )}
                  <a href="tel:0672220261" className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" /> Call KMC
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <div className="w-7 h-7 rounded-full bg-kmc-navy flex items-center justify-center text-kmc-gold shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-kmc-blue focus:ring-1 focus:ring-kmc-blue/20 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className="p-2.5 bg-kmc-navy text-white rounded-xl hover:bg-kmc-navy-light disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[9px] text-slate-400 mt-2">{t.disclaimer}</p>
      </div>
    </div>
  );
}
