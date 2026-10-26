import React, { useState } from 'react';
import { FileText, Search, PlusCircle, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Building, User, ArrowLeft } from 'lucide-react';

export default function PortalComplaints({ complaints, onOpenReport }) {
  const [selectedTicket, setSelectedTicket] = useState(complaints[0] || null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter(c => 
    c.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'RESOLVED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'REJECTED': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">My Complaints</h1>
          <p className="text-sm text-slate-500 mt-1">Track the progress of your municipal service requests.</p>
        </div>
        <button onClick={onOpenReport} className="btn-gov text-sm py-2.5 px-5 shadow-sm">
          <PlusCircle className="w-4 h-4" /> File New Complaint
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ticket List (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input 
              type="text" 
              placeholder="Search by Ticket ID or Title..." 
              className="input-gov pl-12 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-175 overflow-y-auto pr-2 custom-scrollbar">
            {filteredComplaints.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-kmc-navy text-white border-kmc-navy shadow-md transform scale-[1.02]' 
                    : 'bg-white border-slate-200 hover:border-kmc-blue hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${selectedTicket?.id === ticket.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {ticket.ticketCode}
                  </span>
                  <span className={`badge-gov text-[10px] ${selectedTicket?.id === ticket.id ? 'bg-white/10 text-white border-white/20' : getStatusBadge(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className={`font-bold text-sm mb-1 ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-kmc-navy'}`}>{ticket.title}</h3>
                <p className={`text-xs flex items-center gap-1 ${selectedTicket?.id === ticket.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  <MapPin className="w-3 h-3" /> {ticket.location || ticket.zone}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ticket Detail & Timeline (7 Columns) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="card-gov p-6 sm:p-8 space-y-8 sticky top-24">
              
              {/* Header */}
              <div className="border-b border-slate-200 pb-6">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-mono text-sm font-bold text-kmc-blue bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    {selectedTicket.ticketCode}
                  </span>
                  <span className={`badge-gov ${getStatusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-kmc-navy">{selectedTicket.title}</h2>
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-kmc-gold" /> {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Building className="w-4 h-4 text-kmc-gold" /> {selectedTicket.department || 'Pending Assignment'}</span>
                </p>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Issue Description</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Timeline Tracker */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Resolution Progress</h4>
                <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Submitted */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-kmc-blue text-white flex items-center justify-center ring-4 ring-white z-10">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-kmc-navy">Complaint Submitted</p>
                      <p className="text-xs text-slate-500">Recorded in SMCMS database.</p>
                    </div>
                  </div>

                  {/* Step 2: Assigned */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white z-10 ${['IN_PROGRESS', 'RESOLVED'].includes(selectedTicket.status) ? 'bg-kmc-blue text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${['IN_PROGRESS', 'RESOLVED'].includes(selectedTicket.status) ? 'text-kmc-navy' : 'text-slate-400'}`}>Assigned to Division</p>
                      <p className="text-xs text-slate-500">{selectedTicket.department || 'Awaiting departmental routing...'}</p>
                    </div>
                  </div>

                  {/* Step 3: In Progress */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white z-10 ${selectedTicket.status === 'RESOLVED' ? 'bg-kmc-blue text-white' : selectedTicket.status === 'IN_PROGRESS' ? 'bg-amber-400 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                      {selectedTicket.status === 'IN_PROGRESS' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${['IN_PROGRESS', 'RESOLVED'].includes(selectedTicket.status) ? 'text-kmc-navy' : 'text-slate-400'}`}>Field Work In Progress</p>
                      <p className="text-xs text-slate-500">Municipal crew executing repairs on site.</p>
                    </div>
                  </div>

                  {/* Step 4: Resolved */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white z-10 ${selectedTicket.status === 'RESOLVED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${selectedTicket.status === 'RESOLVED' ? 'text-emerald-600' : 'text-slate-400'}`}>Resolved & Verified</p>
                      <p className="text-xs text-slate-500">Issue successfully closed by officer.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="card-gov p-12 text-center h-full flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Select a complaint to view its live status timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}