import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function AdminNews() {
  const [activeSection, setActiveSection] = useState('notices'); // 'notices' or 'news'
  const [notices, setNotices] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [noticeForm, setNoticeForm] = useState({ title: '', noticeType: 'General', badge: 'Official', summary: '' });
  const [newsForm, setNewsForm] = useState({ title: '', category: 'General', summary: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [noticesData, newsData] = await Promise.all([
        api.adminGetNotices().catch(() => []),
        api.adminGetNews().catch(() => [])
      ]);
      setNotices(Array.isArray(noticesData) ? noticesData : []);
      setNews(Array.isArray(newsData) ? newsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.adminCreateNotice({
        ...noticeForm,
        publishedAt: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);
      setNoticeForm({ title: '', noticeType: 'General', badge: 'Official', summary: '' });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.adminCreateNews(newsForm);
      setIsModalOpen(false);
      setNewsForm({ title: '', category: 'General', summary: '' });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create news');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this public notice?')) return;
    try {
      await api.adminDeleteNotice(id);
      await fetchData();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Delete this news article?')) return;
    try {
      await api.adminDeleteNews(id);
      await fetchData();
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Switcher */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">News & Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Manage public notices and news published across the council portals.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('notices')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition ${
                activeSection === 'notices'
                  ? 'bg-kmc-navy text-white shadow-sm'
                  : 'text-slate-600 hover:text-kmc-navy'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Public Notices</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSection === 'notices' ? 'bg-kmc-gold text-kmc-navy font-bold' : 'bg-slate-200 text-slate-600'
              }`}>{notices.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('news')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition ${
                activeSection === 'news'
                  ? 'bg-kmc-navy text-white shadow-sm'
                  : 'text-slate-600 hover:text-kmc-navy'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News Articles</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSection === 'news' ? 'bg-kmc-gold text-kmc-navy font-bold' : 'bg-slate-200 text-slate-600'
              }`}>{news.length}</span>
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-gold py-2 px-4 text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSection === 'notices' ? 'Create Notice' : 'Create Article'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">{activeSection === 'notices' ? 'Type / Badge' : 'Category'}</th>
              <th className="p-4">Date</th>
              <th className="p-4">Summary</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-kmc-blue mx-auto mb-2" />
                  Loading data from database...
                </td>
              </tr>
            ) : activeSection === 'notices' ? (
              notices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    No public notices found in database.
                  </td>
                </tr>
              ) : (
                notices.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-kmc-navy max-w-xs">{item.title}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge-gov badge-warning text-[10px] font-bold">
                          {item.noticeType || 'General'}
                        </span>
                        {item.badge && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap text-xs">
                      {formatDate(item.publishedAt)}
                    </td>
                    <td className="p-4 text-slate-600 text-xs max-w-md truncate">
                      {item.summary}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteNotice(item.id)}
                        title="Delete Notice"
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )
            ) : (
              news.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    No news articles found in database.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-kmc-navy max-w-xs">{item.title}</td>
                    <td className="p-4">
                      <span className="badge-gov badge-info text-[10px] font-bold">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap text-xs">
                      {formatDate(item.publishedAt)}
                    </td>
                    <td className="p-4 text-slate-600 text-xs max-w-md truncate">
                      {item.summary}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        title="Delete Article"
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Notice or Article */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-kmc-navy p-4 flex justify-between items-center text-white">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                {activeSection === 'notices' ? (
                  <>
                    <Bell className="w-5 h-5 text-kmc-gold" />
                    <span>New Public Notice</span>
                  </>
                ) : (
                  <>
                    <Newspaper className="w-5 h-5 text-kmc-gold" />
                    <span>New News Article</span>
                  </>
                )}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeSection === 'notices' ? (
              <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Q4 Tax Rebate"
                    className="input-gov"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Financial / Health"
                      className="input-gov"
                      value={noticeForm.noticeType}
                      onChange={(e) => setNoticeForm({ ...noticeForm, noticeType: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Discount / Urgent"
                      className="input-gov"
                      value={noticeForm.badge}
                      onChange={(e) => setNoticeForm({ ...noticeForm, badge: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Summary / Message</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Notice details..."
                    className="input-gov"
                    value={noticeForm.summary}
                    onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-gov w-full py-3">
                  {isSubmitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateNews} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Article Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Smart Waste Bins Deployed"
                    className="input-gov"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Smart City / Public Works"
                    className="input-gov"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Summary</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Article summary..."
                    className="input-gov"
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-gov w-full py-3">
                  {isSubmitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}