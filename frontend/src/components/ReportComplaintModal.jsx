import React, { useState } from 'react';
import { 
  X, FileText, MapPin, AlertCircle, CheckCircle2, Upload, 
  Loader2, Image as ImageIcon 
} from 'lucide-react';
import { api } from '../api';

export default function ReportComplaintModal({ isOpen, onClose, onTicketCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Waste Management',
    description: '',
    location: '',
    zone: '',
    priority: 'Medium',
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  if (!isOpen) return null;

  const categories = [
    'Waste Management',
    'Road & Infrastructure',
    'Water Supply',
    'Drainage',
    'Street Lighting',
    'Public Facilities',
    'Other',
  ];

  const zones = [
    'Kalmunai Town',
    'Sainthamaruthu',
    'Kalmunaikudi',
    'Natpiddimunai',
    'Maruthamunai',
    'Pandiruppu',
    'Periyaneelavanai',
    'Chenaikudiyiruppu',
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.title.trim()) return setErrorMsg('Please enter a complaint title.');
    if (!form.description.trim()) return setErrorMsg('Please describe the issue.');
    if (!form.location.trim()) return setErrorMsg('Please enter the exact location.');
    if (!form.zone) return setErrorMsg('Please select your zone.');

    setIsSubmitting(true);
    try {
      const result = await api.createComplaint(form, file);
      if (result?.ticketCode) {
        setSuccessTicket(result);
        if (onTicketCreated) onTicketCreated(result);
      } else {
        setErrorMsg('Failed to submit complaint. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ title: '', category: 'Waste Management', description: '', location: '', zone: '', priority: 'Medium' });
    setFile(null);
    setErrorMsg('');
    setSuccessTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-kmc-navy px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[#D4AF37] border border-white/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-serif font-bold text-lg leading-tight">File a Complaint</h2>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider">Kalmunai Municipal Council</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#16324F]">Complaint Submitted!</h3>
              <p className="text-sm text-slate-500 mt-1">Your issue has been logged successfully.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase">Your Tracking ID</p>
              <p className="text-2xl font-black font-mono text-[#D4AF37] mt-1">{successTicket.ticketCode}</p>
            </div>
            <p className="text-xs text-slate-500">
              You can track the progress in <strong>My Complaints</strong> tab.
            </p>
            <button onClick={handleClose} className="btn-gov w-full py-2.5 text-sm">
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Complaint Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Broken streetlight near market"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue"
                maxLength={100}
              />
            </div>

            {/* Category + Zone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Your Zone
              </label>
              <select
                value={form.zone}
                onChange={(e) => handleChange('zone', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue"
              >
                <option value="">Select your zone...</option>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Exact Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Main Street, near Bank of Ceylon"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue resize-none"
              />
              <p className="text-[10px] text-slate-400 text-right mt-1">{form.description.length}/500</p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Photo Evidence (Optional)
              </label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-[#D4AF37] hover:bg-amber-50/30 transition">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-500">
                  {file ? file.name : 'Click to upload photo (JPG, PNG)'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 text-sm font-bold text-white bg-kmc-navy hover:bg-kmc-navy-light rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><FileText className="w-4 h-4" /> Submit Complaint</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}