import React, { useState } from 'react';
import { X, PlusCircle, UploadCloud, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ReportComplaintModal({ isOpen, onClose, onTicketCreated }) {
  const [category, setCategory] = useState('sanitation');
  const [zone, setZone] = useState('Kalmunai Town Zone A');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoName, setPhotoName] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newId = 'KMC-2026-' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedTicketId(newId);

    const categoryNames = {
      sanitation: 'Smart Waste & Sanitation',
      electrical: 'Street Lighting & Electrical',
      drainage: 'Drainage & Water Stagnation',
      roads: 'Road & Pothole Maintenance'
    };

    const newTicket = {
      id: newId,
      title: title || 'Civic Infrastructure Concern',
      category: categoryNames[category] || category,
      zone,
      location: zone,
      date: new Date().toISOString().slice(0, 10),
      priority: 'High (AI Triage)',
      status: 'In Progress',
      officer: 'Dispatch Crew Assigned',
      department: category === 'electrical' ? 'Electrical Division' : 'Public Works & Sanitation',
      description,
      timeline: [
        { step: 'Issue Submitted Online', date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
        { step: 'AI Priority & Duplicate Check', date: 'Immediate', done: true },
        { step: 'Field Crew Dispatched', date: 'In Queue', done: false }
      ]
    };

    // Send to Spring Boot Backend API (PostgreSQL database)
    await api.createComplaint(newTicket);

    if (onTicketCreated) {
      onTicketCreated(newTicket);
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setTitle('');
    setDescription('');
    setPhotoName(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 text-white rounded-3xl max-w-lg w-full border border-zinc-800 shadow-2xl overflow-hidden relative my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Report Municipal Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-zinc-300">
                Submit details regarding road damages, waste overflow, streetlights, or water leaks.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="sanitation">Waste & Garbage Overflow</option>
                  <option value="electrical">Streetlight Malfunction</option>
                  <option value="drainage">Drainage Blockage & Water Stagnation</option>
                  <option value="roads">Road Damage & Potholes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Zone / Administrative Ward
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Kalmunai Town Zone A">Kalmunai Town Zone A</option>
                  <option value="Kalmunai South Zone B">Kalmunai South Zone B</option>
                  <option value="Sainthamaruthu Zone C">Sainthamaruthu Zone C</option>
                  <option value="Natpattimunai Zone D">Natpattimunai Zone D</option>
                  <option value="Pandiruppu Zone E">Pandiruppu Zone E</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Brief Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Street lamp broken opposite Bank of Ceylon"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide landmark details or nature of obstruction..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              {/* Upload evidence simulation */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Attach Photo / Geotagged Evidence (Optional)
                </label>
                <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 text-center cursor-pointer transition bg-black/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-zinc-400">
                    {photoName ? (
                      <span className="text-white font-medium">{photoName}</span>
                    ) : (
                      "Click to upload image or drag & drop"
                    )}
                  </p>
                  <span className="text-[10px] text-zinc-600">JPG, PNG up to 10MB</span>
                </div>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-200">AI Routing Enabled:</strong> Your report will be automatically classified by priority and routed directly to the on-duty field inspector.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/60 transition"
              >
                Submit Citizen Complaint
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Complaint Lodged Successfully</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Your ticket has been recorded in the Kalmunai Municipal database.
                </p>
              </div>

              <div className="bg-black border border-zinc-800 p-4 rounded-2xl max-w-xs mx-auto space-y-1">
                <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">Your Ticket ID</span>
                <p className="text-xl font-black font-mono text-red-500">{generatedTicketId}</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl border border-zinc-800 text-xs transition"
                >
                  Submit Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
