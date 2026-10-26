import React, { useState } from 'react';
import { Search, CheckCircle2, MapPin, Building2, Clock, AlertCircle, FileSearch, ShieldCheck, FileText, Send, Cpu, Wrench, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api';
import { formatDate, getStatusColor } from '../../utils/formatters';

export default function TicketTracker() {
  const { dict } = useLanguage();
  const t = dict?.tracker || {};
  const [searchId, setSearchId] = useState('');
  const [foundTicket, setFoundTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submitIcons = [Send, Cpu, Wrench, CheckSquare];

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanId = searchId.trim().toUpperCase();
    if (!cleanId) return;
    setLoading(true);
    setErrorMsg('');
    setFoundTicket(null);
    try {
      const data = await api.getComplaintByTicket(cleanId);
      if (!data) setErrorMsg(t.noRecord || 'No record found.');
      else setFoundTicket(data);
    } catch {
      setErrorMsg(t.serverError || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="tracker" className="py-20 bg-transparent border-b border-slate-200/50 relative overflow-hidden">
      <div className="relative max-w-325 mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-kmc-navy tracking-tight leading-tight">{t.title}</h2>
          <p className="text-sm text-slate-600 font-light">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10 relative z-10">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-200">
              <ShieldCheck className="w-5 h-5 text-kmc-blue" />
              <h3 className="font-serif text-lg font-bold text-kmc-navy">{t.howTitle}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.steps?.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-kmc-blue font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{item.step}</div>
                  <div>
                    <h4 className="font-bold text-kmc-navy text-xs">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-200">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif text-lg font-bold text-kmc-navy">{t.submitTitle}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.submitSteps?.map((item, idx) => {
                const Icon = submitIcons[idx] || Send;
                return (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-500">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-kmc-navy text-xs">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-xl shadow-slate-200/60 focus-within:ring-2 focus-within:ring-kmc-blue/20 transition-all">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4" />
                <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder={t.placeholder} className="w-full bg-transparent text-kmc-navy text-base font-mono pl-12 pr-4 py-3.5 rounded-xl focus:outline-none placeholder:text-slate-400" />
              </div>
              <button type="submit" disabled={loading} className="btn-gov py-3.5 px-8 shrink-0 text-base shadow-md">
                <FileSearch className="w-5 h-5" /><span>{loading ? t.searching : t.btnSearch}</span>
              </button>
            </div>
          </form>
        </div>

        {errorMsg && (
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 flex items-center justify-center gap-2 mt-6 relative z-10 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {foundTicket && (
          <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 relative z-10">
            <div className="bg-kmc-navy p-6 flex flex-wrap justify-between items-start gap-4">
              <div>
                <span className="font-mono text-sm font-bold text-kmc-gold bg-white/10 px-3 py-1 rounded-md border border-white/20">{foundTicket.ticketCode || foundTicket.ticketNo}</span>
                <h3 className="text-xl font-serif font-bold text-white mt-2">{foundTicket.title}</h3>
                <p className="text-sm text-slate-300 flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-kmc-gold" />{foundTicket.location || foundTicket.zone}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-kmc-gold" />{formatDate(foundTicket.createdAt)}</span>
                </p>
              </div>
              <span className={`badge-gov text-sm px-4 py-1.5 ${getStatusColor(foundTicket.status)}`}>{foundTicket.status?.replace('_', ' ')}</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border-b border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">{t.dept}</p>
                <p className="text-sm font-semibold text-kmc-navy flex items-center gap-2 mt-1"><Building2 className="w-4 h-4 text-kmc-blue" />{foundTicket.department || t.pendingAssign}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">{t.officer}</p>
                <p className="text-sm font-semibold text-kmc-navy flex items-center gap-2 mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" />{foundTicket.assignedOfficer || t.defaultOfficer}</p>
              </div>
            </div>
            {foundTicket.timeline && foundTicket.timeline.length > 0 && (
              <div className="p-6">
                <h4 className="text-sm font-bold text-kmc-navy mb-5 flex items-center gap-2 uppercase tracking-wide"><Clock className="w-4 h-4 text-kmc-blue" />{t.progress}</h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                  {foundTicket.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 pl-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}</div>
                      <div className="flex-1 pb-1">
                        <p className={`text-sm font-semibold ${step.done ? 'text-kmc-navy' : 'text-slate-400'}`}>{step.step}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{step.date || step.stepTime || 'Pending'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}