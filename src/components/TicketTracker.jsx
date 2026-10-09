import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, MapPin, User, AlertCircle, FileSearch } from 'lucide-react';
import { mockTickets } from '../data/mockData';
import { translations } from '../data/translations';

export default function TicketTracker({ lang }) {
  const t = translations[lang].tracker;
  const [searchId, setSearchId] = useState('KMC-2026-8492');
  const [foundTicket, setFoundTicket] = useState(mockTickets['KMC-2026-8492']);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanId = searchId.trim().toUpperCase();
    if (mockTickets[cleanId]) {
      setFoundTicket(mockTickets[cleanId]);
      setErrorMsg('');
    } else {
      setFoundTicket(null);
      setErrorMsg(`No ticket record found for ID: "${cleanId}". Please verify your ticket ID.`);
    }
  };

  return (
    <section id="tracker" className="py-20 bg-black text-white relative border-t border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 bg-red-950/80 px-3.5 py-1 rounded-full border border-red-600/40">
            {t.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.title}
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Search Bar Widget */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row gap-3 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-zinc-500 absolute left-4" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder={t.placeholder}
                className="w-full bg-black text-white text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 border border-zinc-800 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-950/50 transition flex items-center justify-center gap-2"
            >
              <FileSearch className="w-4 h-4" />
              <span>{t.btnSearch}</span>
            </button>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-3">{t.sampleMsg}</p>
        </form>

        {/* Error view */}
        {errorMsg && (
          <div className="bg-red-950/60 border border-red-600/50 rounded-2xl p-6 text-center text-red-200 max-w-2xl mx-auto flex items-center justify-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Found Ticket Details Card */}
        {foundTicket && (
          <div className="bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl space-y-8 max-w-4xl mx-auto">
            {/* Top Overview */}
            <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950 px-2.5 py-1 rounded border border-red-600/30">
                    {foundTicket.id}
                  </span>
                  <span className="text-xs font-semibold text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded">
                    {foundTicket.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{foundTicket.title}</h3>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {foundTicket.location}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${
                    foundTicket.status === 'Resolved'
                      ? 'bg-red-600/20 text-red-400 border-red-500/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  Status: {foundTicket.status}
                </span>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Priority: <strong className="text-white">{foundTicket.priority}</strong>
                </p>
              </div>
            </div>

            {/* Department Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/60 p-4 rounded-2xl border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-400">Assigned Department:</span>
                <p className="font-semibold text-zinc-200 text-sm mt-0.5">{foundTicket.department}</p>
              </div>
              <div>
                <span className="text-zinc-400">Field Supervisor / Officer:</span>
                <p className="font-semibold text-zinc-200 text-sm mt-0.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-500" />
                  {foundTicket.assignedOfficer}
                </p>
              </div>
            </div>

            {/* Step Timeline */}
            <div>
              <h4 className="text-sm font-bold text-zinc-200 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" /> Resolution Workflow Timeline
              </h4>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-zinc-800">
                {foundTicket.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                        step.done
                          ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800 flex-1 flex justify-between items-center">
                      <div>
                        <p className={`text-sm font-semibold ${step.done ? 'text-white' : 'text-zinc-500'}`}>
                          {step.step}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 shrink-0 ml-4">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
