import React, { useState, useCallback } from 'react';
import { 
  X, FileText, MapPin, AlertCircle, CheckCircle2, Upload, 
  Loader2, ChevronDown, ChevronUp 
} from 'lucide-react';
import { api } from '../api';
import LocationPickerMap from './common/LocationPickerMap';
import { ZONE_COORDINATES } from '../config/maps';

// Error boundary to prevent any map issues from crashing the modal
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error('Map error caught in boundary:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between mt-2">
          <span>Map preview unavailable. You can enter the location in the text field above.</span>
          <button 
            type="button" 
            onClick={() => this.setState({ hasError: false })}
            className="text-xs font-bold text-amber-900 underline ml-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

export default function ReportComplaintModal({ isOpen, onClose, onTicketCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Waste Management',
    description: '',
    location: '',
    zone: '',
    priority: 'Medium',
    latitude: null,
    longitude: null,
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleLocationSelect = useCallback(({ latitude, longitude, address }) => {
    setForm(prev => ({
      ...prev,
      latitude,
      longitude,
      location: address || prev.location || `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
    }));
    setErrorMsg('');
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.title.trim()) return setErrorMsg('Please enter a complaint title.');
    if (!form.description.trim()) return setErrorMsg('Please describe the issue.');
    if (!form.location.trim()) return setErrorMsg('Please enter or pick the exact location on the map.');
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
    setForm({ 
      title: '', 
      category: 'Waste Management', 
      description: '', 
      location: '', 
      zone: '', 
      priority: 'Medium',
      latitude: null,
      longitude: null,
    });
    setFile(null);
    setErrorMsg('');
    setSuccessTicket(null);
    setShowMap(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-kmc-navy px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[#D4AF37] border border-white/20 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-serif font-bold text-lg leading-tight">File a Complaint</h2>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Kalmunai Municipal Council</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="text-slate-300 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {successTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-kmc-navy">Complaint Registered!</h3>
              <p className="text-xs text-slate-500 mt-1">Your grievance has been submitted to the municipal council.</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket Code:</span>
                <span className="font-bold text-kmc-blue">{successTicket.ticketCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-700">{successTicket.department || 'General Administration'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-amber-600">{successTicket.status || 'SUBMITTED'}</span>
              </div>
              {form.location && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[200px]">{form.location}</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              You can track the progress of this ticket under "My Complaints" tab.
            </p>
            <button 
              type="button"
              onClick={handleClose}
              className="w-full py-3 bg-kmc-gold hover:bg-yellow-500 text-kmc-navy font-bold rounded-lg transition shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Complaint Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Complaint Title
              </label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Broken streetlight near market"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition"
              />
            </div>

            {/* Category & Zone in a clean side-by-side grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition font-medium"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Your Zone
                </label>
                <select
                  value={form.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition font-medium"
                >
                  <option value="">Select your zone...</option>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>

            {/* Exact Location with Google Map & One-Click Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Exact Location
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-md transition border border-blue-200/60 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{showMap ? 'Hide Map' : 'Select on Map (1-Click)'}</span>
                  {showMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={form.location}
                  onFocus={() => setShowMap(true)}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Main Street, near Bank of Ceylon"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition"
                />
              </div>

              {/* 1-Click Interactive Map Picker wrapped in ErrorBoundary */}
              {showMap && (
                <div className="mt-2.5">
                  <MapErrorBoundary>
                    <LocationPickerMap
                      selectedPosition={
                        form.latitude && form.longitude
                          ? { lat: form.latitude, lng: form.longitude }
                          : null
                      }
                      zoneCenter={ZONE_COORDINATES[form.zone] || null}
                      onLocationSelect={handleLocationSelect}
                      height="230px"
                    />
                  </MapErrorBoundary>
                </div>
              )}
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
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue resize-none transition"
              />
              <p className="text-[10px] text-slate-400 text-right mt-1">{form.description.length}/500</p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Photo Evidence (Optional)
              </label>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-3.5 cursor-pointer hover:border-[#D4AF37] hover:bg-amber-50/30 transition">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">
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
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 text-sm font-bold text-white bg-kmc-navy hover:bg-kmc-navy-light rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
