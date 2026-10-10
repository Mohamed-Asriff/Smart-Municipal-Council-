import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const EMPTY = { title: '', noticeType: '', badge: '', summary: '', publishedAt: new Date().toISOString().slice(0,10) };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const data = await api.getNotices();
    setNotices(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const created = await api.adminCreateNotice(form);
    if (created) {
      setForm(EMPTY);
      setMsg('Notice published.');
      await load();
    } else {
      setMsg('Failed to publish notice.');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    const ok = await api.adminDeleteNotice(id);
    if (ok) await load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-500" />
          Publish Public Notice
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            required type="text" placeholder="Title"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              required type="text" placeholder="Type (e.g. Financial)"
              value={form.noticeType} onChange={(e) => setForm({ ...form, noticeType: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
            />
            <input
              type="text" placeholder="Badge (e.g. Discount)"
              value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
            />
            <input
              type="date"
              value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
            />
          </div>
          <textarea
            required rows="3" placeholder="Summary"
            value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none resize-none"
          />
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Publishing…' : 'Publish Notice'}
          </button>
          {msg && <p className="text-xs text-red-400 font-semibold">{msg}</p>}
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Active Notices ({notices.length})</h3>
        {notices.length === 0 ? (
          <p className="text-sm text-zinc-500">No notices yet.</p>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="flex justify-between items-start gap-4 p-4 bg-black/50 border border-zinc-800 rounded-xl">
                <div>
                  <p className="text-xs text-red-400 font-semibold">{n.noticeType} • {n.publishedAt}</p>
                  <p className="font-bold text-white mt-1">{n.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{n.summary}</p>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/40 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}