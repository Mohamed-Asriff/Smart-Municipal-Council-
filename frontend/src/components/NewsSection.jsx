import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../data/translations';

export default function NewsSection({ lang }) {
  const t = translations[lang].announcements;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await api.getNews();
      setArticles(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  return (
    <section id="announcements" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-sm font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
            {t.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight">
            {t.title}
          </h2>
          <p className="text-zinc-600 text-lg sm:text-xl font-normal">{t.subtitle}</p>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500 text-sm">Loading announcements…</p>
        ) : articles.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm">No announcements yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-zinc-200 hover:border-red-500/60 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                    <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wide border border-red-100">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
                      <Calendar className="w-4 h-4 text-red-600" />
                      {article.publishedAt}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-3 leading-snug group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-5">{article.summary}</p>
                </div>
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    {article.author}
                  </span>
                  <button className="text-red-600 font-bold hover:text-red-700 hover:underline flex items-center gap-1.5">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}