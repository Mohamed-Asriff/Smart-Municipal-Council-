import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', noticeType: 'General', badge: 'Official', summary: '' });

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetNotices();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.adminCreateNotice(form);
      setIsModalOpen(false);
      setForm({ title: '', noticeType: 'General', badge: 'Official', summary: '' });
      fetchNotices();
    } catch (err) {
      alert(err.message || 'Failed to create notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.adminDeleteNotice(id);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Public Notices</h1>
          <p className="text-sm text-slate-500 mt-1">Manage official council notices.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-gold py-2.5 px-4 text-sm shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Notice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading notices...</td></tr>
            ) : notices.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No notices found.</td></tr>
            ) : (
              notices.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-kmc-navy">{item.title}</td>
                  <td className="p-4"><span className="badge-gov badge-warning text-[10px]">{item.noticeType}</span></td>
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
              <h3 className="font-serif font-bold text-lg flex items-center gap-2"><Bell className="w-5 h-5"/> New Notice</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input required type="text" className="input-gov" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <input required type="text" className="input-gov" value={form.noticeType} onChange={e => setForm({...form, noticeType: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge</label>
                  <input required type="text" className="input-gov" value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary</label>
                <textarea required rows="3" className="input-gov" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-gov w-full py-3">
                {isSubmitting ? 'Publishing...' : 'Publish Notice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}