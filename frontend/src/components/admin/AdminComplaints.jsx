import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await api.adminGetAllComplaints();
    setComplaints(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    const updated = await api.adminUpdateComplaint(id, { status });
    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setSelected(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            All Citizen Complaints
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{complaints.length} total tickets</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-zinc-500">No complaints filed yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selected?.id === c.id
                    ? 'bg-zinc-900 border-red-500'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-red-400">{c.ticketCode}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {c.status}
                  </span>
                </div>
                <p className="font-bold text-sm text-white">{c.title}</p>
                <p className="text-xs text-zinc-400 mt-1">{c.zone}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7">
            {selected ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 sticky top-24">
                <div>
                  <p className="text-xs font-mono text-red-400 font-bold">{selected.ticketCode}</p>
                  <h3 className="text-xl font-bold text-white mt-1">{selected.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {selected.category} • {selected.zone} • {selected.location}
                  </p>
                </div>

                <div className="bg-black/60 p-4 rounded-2xl border border-zinc-800">
                  <p className="text-xs text-zinc-400 uppercase mb-1">Description</p>
                  <p className="text-sm text-zinc-200">{selected.description || '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-zinc-500">Priority</p>
                    <p className="text-white font-bold">{selected.priority}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Department</p>
                    <p className="text-white font-bold">{selected.department || '—'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 uppercase mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['Submitted', 'In Progress', 'Dispatched', 'Resolved'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          selected.status === s
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-sm">
                Select a complaint to view and update.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}