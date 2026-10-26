import React, { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, Clock, CheckCircle2, 
  MapPin, Building, ShieldAlert, FileText, User 
} from 'lucide-react';
import { api } from '../../api';
import { STATUS, normalizeStatus, statusLabel, statusBadgeClass } from '../../utils/statusMap';
import { formatDate } from '../../utils/formatters';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action States
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetAllComplaints();
      const list = Array.isArray(data) ? data : [];
      setComplaints(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchComplaints(); 
  }, []);

  const handleUpdateStatus = async () => {
    if (!newStatus || !selected) return;
    setIsUpdating(true);
    setFeedback({ type: '', msg: '' });
    
    try {
      const updated = await api.adminUpdateComplaint(selected.id, { status: newStatus, note });
      if (updated) {
        setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
        setNewStatus('');
        setNote('');
        setFeedback({ type: 'success', msg: 'Ticket status updated successfully.' });
      } else {
        throw new Error('Update failed.');
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to update.' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Municipal Grievances</h1>
          <p className="text-sm text-slate-500 mt-1">Review, assign, and resolve citizen complaints.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search Ticket ID..." 
              className="input-gov pl-9 py-2.5 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Refresh button removed here */}
        </div>
      </div>

      {/* Master-Detail Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Ticket List */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Queue</span>
            <span className="bg-kmc-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{filteredComplaints.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500 text-sm">Loading...</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No tickets found.</div>
            ) : (
              filteredComplaints.map(ticket => (
                <button 
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selected?.id === ticket.id ? 'bg-blue-50/50 border-l-4 border-l-kmc-blue' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs font-bold text-kmc-blue">{ticket.ticketCode}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusBadgeClass(ticket.status)}`}>
                      {statusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-kmc-navy truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>{ticket.category}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail & Action Panel */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto custom-scrollbar">
          {selected ? (
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Header */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-slate-200">
                <div>
                  <span className="font-mono text-sm font-bold text-kmc-blue bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    {selected.ticketCode}
                  </span>
                  <h2 className="text-2xl font-bold text-kmc-navy mt-3">{selected.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-kmc-gold" /> {selected.location}</span>
                    <span className="flex items-center gap-1"><Building className="w-4 h-4 text-kmc-gold" /> {selected.category}</span>
                  </div>
                </div>
                <span className={`badge-gov text-sm px-3 py-1 ${statusBadgeClass(selected.status)}`}>
                  {statusLabel(selected.status)}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Citizen Description</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3" /> Citizen</p>
                  <p className="text-sm font-semibold text-kmc-navy mt-1 truncate">{selected.citizenName || 'Anonymous'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Priority</p>
                  <p className={`text-sm font-semibold mt-1 ${selected.priority?.toUpperCase() === 'HIGH' || selected.priority?.toUpperCase() === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>{selected.priority || 'MEDIUM'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Building className="w-3 h-3" /> Department</p>
                  <p className="text-sm font-semibold text-kmc-navy mt-1 truncate">{selected.department || 'Unassigned'}</p>
                </div>
              </div>

              {/* Action Form */}
              <div className="bg-kmc-navy/5 p-6 rounded-xl border border-kmc-navy/10">
                <h4 className="text-sm font-bold text-kmc-navy mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-kmc-blue" /> Update Status & Dispatch
                </h4>
                
                {feedback.msg && (
                  <div className={`mb-4 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {feedback.msg}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">New Status</label>
                      <select 
                        className="input-gov" 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="">Select status...</option>
                        <option value="IN_PROGRESS">Dispatch to Field</option>
                        <option value="RESOLVED">Mark as Resolved</option>
                        <option value="REJECTED">Reject (Invalid)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Internal Note (Optional)</label>
                      <input 
                        type="text" 
                        className="input-gov" 
                        placeholder="e.g. Crew #4 dispatched..." 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdateStatus} 
                    disabled={isUpdating || !newStatus} 
                    className="btn-gov w-full py-2.5 text-sm"
                  >
                    {isUpdating ? 'Processing...' : 'Submit Update'}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              <AlertCircle className="w-12 h-12 mb-4 text-slate-300" />
              <p>Select a ticket from the queue to manage it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}