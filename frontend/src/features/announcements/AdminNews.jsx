import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'General', summary: '' });

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetNews();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.adminCreateNews(form);
      setIsModalOpen(false);
      setForm({ title: '', category: 'General', summary: '' });
      fetchNews();
    } catch (err) {
      alert(err.message || 'Failed to create news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await api.adminDeleteNews(id);
      fetchNews();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">News & Media</h1>
          <p className="text-sm text-slate-500 mt-1">Publish announcements to the public landing page.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-gold py-2.5 px-4 text-sm shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Article
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading news...</td></tr>
            ) : news.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No news articles found.</td></tr>
            ) : (
              news.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-kmc-navy">{item.title}</td>
                  <td className="p-4"><span className="badge-gov badge-info text-[10px]">{item.category}</span></td>
                  <td className="p-4 text-slate-500">{formatDate(item.publishedAt)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-kmc-navy p-4 flex justify-between items-center text-white">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2"><Newspaper className="w-5 h-5"/> New Article</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input required type="text" className="input-gov" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input required type="text" className="input-gov" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary</label>
                <textarea required rows="4" className="input-gov" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-gov w-full py-3">
                {isSubmitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}