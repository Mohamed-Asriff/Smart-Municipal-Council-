import React, { useEffect, useState } from 'react';
import { Newspaper, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const EMPTY = { title: '', category: '', summary: '', author: '', publishedAt: new Date().toISOString().slice(0,10) };

export default function AdminNews() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await api.getNews();
    setArticles(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const created = await api.adminCreateNews(form);
    if (created) {
      setForm(EMPTY);
      setMsg('Article published successfully.');
      await load();
    } else {
      setMsg('Failed to create article. Check your admin login.');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this article?')) return;
    const ok = await api.adminDeleteNews(id);
    if (ok) await load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-red-500" />
          Create News Article
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            required
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Category (e.g. SMART CITY)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
            />
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Author (optional)"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none"
          />
          <textarea
            required
            rows="3"
            placeholder="Summary"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none resize-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Publishing…' : 'Publish Article'}
          </button>
          {msg && <p className="text-xs text-red-400 font-semibold">{msg}</p>}
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Published Articles ({articles.length})</h3>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-zinc-500">No articles yet.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((a) => (
              <div key={a.id} className="flex justify-between items-start gap-4 p-4 bg-black/50 border border-zinc-800 rounded-xl">
                <div>
                  <p className="text-xs text-red-400 font-semibold">{a.category} • {a.publishedAt}</p>
                  <p className="font-bold text-white mt-1">{a.title}</p>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{a.summary}</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/40 rounded-lg"
                  title="Delete"
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