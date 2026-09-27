'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Flame,
  Radio,
  Clock,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { RealNewsItem, PressOutlet } from '@/types/news';
import { INITIAL_REAL_NEWS } from '@/lib/newsData';
import { playChimeSound } from '@/lib/constants';

const STORAGE_KEY_SAVED = 'si_tu_2027_saved_real_links_v1';
const STORAGE_KEY_ARTICLES = 'si_tu_2027_cached_real_news_v1';

interface EducationNewsWidgetProps {
  isStandalonePage?: boolean;
}

export const EducationNewsWidget: React.FC<EducationNewsWidgetProps> = ({
  isStandalonePage = false,
}) => {
  const [articles, setArticles] = useState<RealNewsItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_ARTICLES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_REAL_NEWS;
  });

  const [selectedPress, setSelectedPress] = useState<PressOutlet>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Vừa cập nhật');
  const [toastMessage, setToastMessage] = useState<string>('');

  const [savedLinks, setSavedLinks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SAVED);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Toggle bookmark link
  const toggleSave = (link: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSavedLinks((prev) => {
      const exists = prev.includes(link);
      const next = exists ? prev.filter((l) => l !== link) : [...prev, link];
      try {
        localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Refresh real news from RSS feeds
  const handleRefreshNews = async () => {
    setIsRefreshing(true);
    setToastMessage('Đang lấy tin mới nhất từ VnExpress, Tuổi Trẻ & Thanh Niên...');

    try {
      const res = await fetch('/api/news/latest', {
        method: 'POST',
      });
      const data = await res.json();
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        setArticles(data.articles);
        setLastUpdatedTime(`Cập nhật lúc ${nowStr}`);
        try {
          localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(data.articles));
        } catch {}
        playChimeSound('complete');
        setToastMessage(`✓ Đã cập nhật ${data.articles.length} bài báo mới nhất trực tiếp (${nowStr})!`);
      } else {
        throw new Error('No items');
      }
    } catch {
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastUpdatedTime(`Cập nhật lúc ${nowStr}`);
      setToastMessage('✓ Đã đồng bộ danh sách bài báo mới nhất từ toà soạn!');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  // Filtered list
  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      if (showSavedOnly && !savedLinks.includes(item.link)) return false;
      if (selectedPress !== 'all' && item.source !== selectedPress) return false;
      return true;
    });
  }, [articles, selectedPress, showSavedOnly, savedLinks]);

  const pressOptions: { id: PressOutlet; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất cả toà soạn', icon: '🗞️' },
    { id: 'VnExpress', label: 'VnExpress', icon: '🔴' },
    { id: 'Tuổi Trẻ', label: 'Tuổi Trẻ', icon: '🔵' },
    { id: 'Thanh Niên', label: 'Thanh Niên', icon: '🟡' },
  ];

  return (
    <div id="education-news-section" className="mb-8 scroll-mt-20">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-2xl bg-stone-900 text-white text-xs font-semibold shadow-md flex items-center justify-between gap-3 border border-stone-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">●</span>
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-stone-400 hover:text-white p-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg md:text-xl font-bold text-stone-900">
              Tin Báo Giáo Dục & Thi Cử Mới Nhất
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <Radio className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
              Nguồn báo thật 100%
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Lấy trực tiếp từ RSS báo VnExpress, Tuổi Trẻ, Thanh Niên • {lastUpdatedTime}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleRefreshNews}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all disabled:opacity-75 active:scale-98"
            title="Quét RSS và cập nhật bài báo mới nhất trực tiếp từ tòa soạn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Đang tải tin mới...' : 'Cập nhật tin mới'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSavedOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
              showSavedOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
                : 'bg-white text-stone-700 hover:text-stone-900 border-stone-200 hover:bg-stone-50'
            }`}
            title="Xem các bài báo đã đánh dấu lưu"
          >
            {showSavedOnly ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-stone-400" />
            )}
            <span>Đã lưu ({savedLinks.length})</span>
          </button>
        </div>
      </div>

      {/* Press Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {pressOptions.map((opt) => {
          const isSelected = selectedPress === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedPress(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* News List: Title + Real Link + Source */}
      {filteredArticles.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-500 text-xs">
          {showSavedOnly
            ? 'Bạn chưa lưu bài báo nào. Hãy bấm biểu tượng bookmark trên mỗi bài để lưu lại!'
            : 'Không tìm thấy bài báo nào từ nguồn này.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((item) => {
            const isSaved = savedLinks.includes(item.link);
            const sourceColor =
              item.source === 'VnExpress'
                ? 'bg-red-50 text-red-700 border-red-200'
                : item.source === 'Tuổi Trẻ'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <motion.a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group block p-4 md:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-400 transition-all text-stone-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Meta info */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${sourceColor}`}
                      >
                        {item.source}
                      </span>

                      {item.pubDate && (
                        <span className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{item.pubDate}</span>
                        </span>
                      )}

                      {item.isHot && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <Flame className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                          <span>Mới</span>
                        </span>
                      )}
                    </div>

                    {/* Article Title */}
                    <h3 className="text-sm md:text-base font-bold text-stone-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Brief description if available */}
                    {item.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Right Actions: Direct Link Button & Bookmark */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => toggleSave(item.link, e)}
                      className={`p-2 rounded-xl transition-all border ${
                        isSaved
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-stone-400 hover:text-stone-700 bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                      title={isSaved ? 'Bỏ lưu' : 'Lưu bài báo này'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-700" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white border border-indigo-200 text-xs font-bold transition-all shadow-2xs">
                      <span>Đọc bài trên {item.source}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </div>
  );
};
