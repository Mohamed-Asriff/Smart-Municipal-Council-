import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Sparkles,
  Calendar
} from 'lucide-react';

export default function PortalComplaints({ 
  complaints, 
  onOpenReport 
}) {
  const [selectedTicket, setSelectedTicket] = useState(complaints[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" />
            Citizen Complaints & Issues
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Track live resolution progress with AI prioritization and field dispatch timeline.
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/60 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Municipal Issue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID (e.g. KMC-2026-8492), category, or keyword..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0 overflow-x-auto">
          {['ALL', 'In Progress', 'Dispatched', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab 
                  ? 'bg-red-600 text-white shadow' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Complaints List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredComplaints.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
              No matching municipal complaints found.
            </div>
          ) : (
            filteredComplaints.map((ticket) => {
              const isSelected = selectedTicket && selectedTicket.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-zinc-900 border-red-500/80 shadow-lg shadow-red-950/20'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/30">
                      {ticket.id}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ticket.status === 'Resolved'
                        ? 'bg-red-600/20 text-white border border-red-500/40'
                        : ticket.status === 'In Progress'
                        ? 'bg-red-950 text-red-300 border border-red-800/60'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-100 line-clamp-1 mb-1">
                    {ticket.title}
                  </h4>

                  <p className="text-xs text-zinc-400 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span className="truncate">{ticket.location || ticket.zone}</span>
                  </p>

                  <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
                    <span>{ticket.category}</span>
                    <span className="text-zinc-400">{ticket.date}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Complaint Detail Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-6 sticky top-24">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-sm text-red-400 bg-red-950 px-2.5 py-1 rounded-lg border border-red-800/40">
                      {selectedTicket.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-600/10 text-red-400 border border-red-600/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Priority: {selectedTicket.priority || 'Medium'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    {selectedTicket.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted: {selectedTicket.date}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-xl ${
                    selectedTicket.status === 'Resolved'
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                      : 'bg-zinc-800 text-white border border-zinc-700 shadow-md'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Department & Officer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/80 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Assigned Department</span>
                  <strong className="text-zinc-200 text-sm">{selectedTicket.department || 'Municipal Engineering'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Field Officer / Unit</span>
                  <strong className="text-zinc-200 text-sm">{selectedTicket.officer || 'Municipal Dispatch Crew'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Municipal Ward / Zone</span>
                  <strong className="text-zinc-200">{selectedTicket.zone || 'Kalmunai Municipality'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Exact Location</span>
                  <strong className="text-zinc-200">{selectedTicket.location}</strong>
                </div>
              </div>

              {/* Issue Description */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Citizen Description
                </h5>
                <p className="text-sm text-zinc-300 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60 leading-relaxed">
                  {selectedTicket.description || 'Issue details logged through digital civic portal.'}
                </p>
              </div>

              {/* Resolution Timeline */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-red-500" />
                  Live Action Timeline
                </h5>

                <div className="relative pl-6 space-y-4 border-l border-zinc-800 ml-2">
                  {(selectedTicket.timeline || [
                    { step: "Issue Filed Online", date: selectedTicket.date, done: true },
                    { step: "Department Review", date: "In Progress", done: true },
                    { step: "Field Repair Completion", date: "Pending", done: false }
                  ]).map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                        step.done 
                          ? 'bg-red-600 border-red-400' 
                          : 'bg-zinc-800 border-zinc-700'
                      }`} />
                      <div className="text-xs">
                        <p className={`font-bold ${step.done ? 'text-zinc-100' : 'text-zinc-500'}`}>
                          {step.step}
                        </p>
                        <p className="text-zinc-500 text-[11px]">{step.date || step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Hotline Info */}
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-zinc-400 flex items-center justify-between">
                <span>Need urgent escalation?</span>
                <a href="tel:0672220261" className="font-bold text-red-400 hover:underline">
                  Call KMC Secretariat: 067-2220261
                </a>
              </div>

            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              Select a complaint ticket to inspect live action status and officer updates.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
