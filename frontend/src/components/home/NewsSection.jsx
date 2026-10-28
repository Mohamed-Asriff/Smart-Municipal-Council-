import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, X, Newspaper, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api';

export default function NewsSection() {
  const { dict } = useLanguage();
  const t = dict?.news || {};
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getNotices();
        setArticles(Array.isArray(data) ? data : []);
      } catch (e) { console.warn(e); } finally { setLoading(false); }
    })();
  }, []);

  return (
    <section id="announcements" className="py-20 bg-transparent border-b border-slate-200/50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-kmc-navy tracking-tight leading-tight">{t.title}</h2>
          <p className="text-base sm:text-lg text-slate-600 font-light max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-kmc-blue mx-auto mb-3" /><p className="text-sm">{t.loading}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-md mx-auto shadow-sm">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">{t.noNews}</p>
            <p className="text-xs text-slate-400 mt-1">{t.noNewsSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <button key={article.id} onClick={() => setSelectedArticle(article)} className="group text-left bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-kmc-blue/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="bg-blue-50 text-kmc-blue font-bold px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px] border border-blue-100">{article.noticeType || article.category || 'Gazette'}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400"><Calendar className="w-3.5 h-3.5" />{article.publishedAt}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-kmc-navy mb-2.5 leading-snug group-hover:text-kmc-blue transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{article.summary}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /><span className="truncate max-w-37.5">{article.author || t.defaultAuthor}</span></span>
                  <span className="text-kmc-blue font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"><span>{t.readBtn}</span><ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-100 bg-kmc-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedArticle(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-kmc-navy p-6 relative overflow-hidden">
              <div className="flex justify-between items-start gap-4 relative z-10">
                <div>
                  <span className="text-[10px] font-bold text-kmc-navy bg-kmc-gold px-2.5 py-1 rounded-md uppercase tracking-wider">{selectedArticle.noticeType || selectedArticle.category || 'Notice'}</span>
                  <h3 className="text-xl font-serif font-bold text-white mt-3 leading-tight">{selectedArticle.title}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-kmc-gold" />{selectedArticle.publishedAt}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-kmc-gold" />{selectedArticle.author || t.defaultAuthor}</span>
                  </p>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{selectedArticle.summary}</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedArticle(null)} className="btn-gov-outline text-sm py-2">{t.closeBtn}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}