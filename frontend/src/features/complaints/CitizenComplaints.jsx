import React, { useState } from 'react';
import { 
  FileText, Search, PlusCircle, MapPin, Calendar, Clock, 
  CheckCircle2, Building, AlertCircle 
} from 'lucide-react';
import { STATUS, normalizeStatus, statusLabel, statusBadgeClass } from '../../utils/statusMap';
import { formatDate } from '../../utils/formatters';

export default function CitizenComplaints({ complaints = [], onOpenReport }) {
  const [selectedTicket, setSelectedTicket] = useState(complaints[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'RESOLVED'

  // Filter logic based on the Tab selected
  const filteredComplaints = complaints.filter(c => {
    const s = normalizeStatus(c.status);
    
    // Status filter
    if (filterTab === 'ACTIVE' && (s === STATUS.RESOLVED || s === STATUS.REJECTED || s === STATUS.CLOSED)) return false;
    if (filterTab === 'RESOLVED' && s !== STATUS.RESOLVED) return false;

    // Search filter
    return c.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.category?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Timeline step logic
  const getStepStatus = (ticket, stepName) => {
    if (!ticket) return 'inactive';
    const s = normalizeStatus(ticket.status);
    
    if (stepName === 'submitted') return 'completed';
    
    if (stepName === 'assigned') {
      return (s === STATUS.IN_PROGRESS || s === STATUS.DISPATCHED || s === STATUS.RESOLVED) ? 'completed' : 'inactive';
    }
    
    if (stepName === 'progress') {
      if (s === STATUS.RESOLVED) return 'completed';
      if (s === STATUS.IN_PROGRESS || s === STATUS.DISPATCHED) return 'active';
      return 'inactive';
    }
    
    if (stepName === 'resolved') {
      return s === STATUS.RESOLVED ? 'completed' : 'inactive';
    }
    
    return 'inactive';
  };

  const renderStepCircle = (status) => {
    if (status === 'completed') {
      return <div className="w-6 h-6 rounded-full bg-kmc-blue text-white flex items-center justify-center ring-4 ring-white z-10"><CheckCircle2 className="w-3.5 h-3.5" /></div>;
    }
    if (status === 'active') {
      return <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center ring-4 ring-white z-10 animate-pulse"><Clock className="w-3.5 h-3.5" /></div>;
    }
    return <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center ring-4 ring-white z-10"><CheckCircle2 className="w-3.5 h-3.5" /></div>;
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
          
          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['ALL', 'ACTIVE', 'RESOLVED'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                  filterTab === tab ? 'bg-white text-kmc-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'ACTIVE' ? 'Active' : 'Resolved'}
              </button>
            ))}
          </div>

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

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No {filterTab.toLowerCase()} complaints found.</p>
              </div>
            ) : (
              filteredComplaints.map(ticket => (
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
                    <span className={`badge-gov text-[10px] ${selectedTicket?.id === ticket.id ? 'bg-white/10 text-white border-white/20' : statusBadgeClass(ticket.status)}`}>
                      {statusLabel(ticket.status)}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-kmc-navy'}`}>{ticket.title}</h3>
                  <p className={`text-xs flex items-center gap-1 ${selectedTicket?.id === ticket.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    <MapPin className="w-3 h-3" /> {ticket.location || ticket.zone}
                  </p>
                </div>
              ))
            )}
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
                  <span className={`badge-gov ${statusBadgeClass(selectedTicket.status)}`}>
                    {statusLabel(selectedTicket.status)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-kmc-navy">{selectedTicket.title}</h2>
                <p className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-kmc-gold" /> {formatDate(selectedTicket.createdAt)}</span>
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
                <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  
                  {/* Step 1: Submitted */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5">{renderStepCircle(getStepStatus(selectedTicket, 'submitted'))}</div>
                    <div>
                      <p className="font-bold text-sm text-kmc-navy">Complaint Submitted</p>
                      <p className="text-xs text-slate-500">Recorded in SMCMS database.</p>
                    </div>
                  </div>

                  {/* Step 2: Assigned */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5">{renderStepCircle(getStepStatus(selectedTicket, 'assigned'))}</div>
                    <div>
                      <p className={`font-bold text-sm ${getStepStatus(selectedTicket, 'assigned') !== 'inactive' ? 'text-kmc-navy' : 'text-slate-400'}`}>Assigned to Division</p>
                      <p className="text-xs text-slate-500">{selectedTicket.department || 'Awaiting departmental routing...'}</p>
                    </div>
                  </div>

                  {/* Step 3: In Progress */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5">{renderStepCircle(getStepStatus(selectedTicket, 'progress'))}</div>
                    <div>
                      <p className={`font-bold text-sm ${getStepStatus(selectedTicket, 'progress') !== 'inactive' ? 'text-kmc-navy' : 'text-slate-400'}`}>Field Work In Progress</p>
                      <p className="text-xs text-slate-500">Municipal crew executing repairs on site.</p>
                    </div>
                  </div>

                  {/* Step 4: Resolved */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5">{renderStepCircle(getStepStatus(selectedTicket, 'resolved'))}</div>
                    <div>
                      <p className={`font-bold text-sm ${getStepStatus(selectedTicket, 'resolved') === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}>Resolved & Verified</p>
                      <p className="text-xs text-slate-500">Issue successfully closed by officer.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escalation Helpline */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-kmc-navy flex justify-between items-center">
                <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-kmc-blue" /> Need urgent escalation?</span>
                <a href="tel:0672220261" className="font-bold text-kmc-blue hover:underline">067-2220261</a>
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