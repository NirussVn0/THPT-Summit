'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Newspaper,
  Sparkles,
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  ArrowRight,
  X,
  ExternalLink,
  Flame,
  CheckCircle2,
  Share2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '@/types/news';
import { EDUCATION_NEWS } from '@/lib/newsData';

const BOOKMARKS_STORAGE_KEY = 'si_tu_2027_news_bookmarks_v1';

export const EducationNewsWidget: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedArticleIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyTitle = (article: NewsArticle) => {
    try {
      navigator.clipboard.writeText(`${article.title} - Sĩ Tử 2027 Tin Tức Giáo Dục`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  // Filter articles
  const filteredArticles = useMemo(() => {
    return EDUCATION_NEWS.filter((article) => {
      // Saved filter
      if (showSavedOnly && !savedArticleIds.includes(article.id)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = article.title.toLowerCase().includes(q);
        const matchSummary = article.summary.toLowerCase().includes(q);
        const matchTags = article.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchTags) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery, showSavedOnly, savedArticleIds]);

  const categories: { id: NewsCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất cả tin tức', icon: '📰' },
    { id: 'thpt', label: 'THPTQG 2027', icon: '📜' },
    { id: 'dgnl', label: 'ĐGNL & ĐGTD', icon: '🎯' },
    { id: 'tuyen-sinh', label: 'Tuyển sinh ĐH', icon: '🌐' },
    { id: 'cam-nang', label: 'Cẩm nang 2K9', icon: '💡' },
  ];

  return (
    <div id="education-news-section" className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-indigo-600" />
              <span>Bản Tin Giáo Dục & Tuyển Sinh 2027</span>
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-2.5 h-2.5" />
              Cập nhật GDPT 2018
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Thông tin chính thức về quy chế thi THPTQG 2027, dạng đề V-ACT, HSA, TSA và kinh nghiệm học tập 2K9
          </p>
        </div>

        {/* Saved Bookmarks Toggle Button */}
        <button
          type="button"
          onClick={() => setShowSavedOnly((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border self-start sm:self-auto shrink-0 ${
            showSavedOnly
              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
              : 'bg-white text-stone-700 hover:text-stone-900 border-stone-200 hover:bg-stone-50'
          }`}
        >
          {showSavedOnly ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-stone-400" />
          )}
          <span>Bài viết đã lưu ({savedArticleIds.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 p-3 rounded-3xl border border-stone-200 shadow-2xs backdrop-blur-xs mb-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-stone-100 rounded-2xl no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id && !showSavedOnly;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowSavedOnly(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-2xs font-bold border-stone-200'
                    : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-white/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa (V-ACT, Toán, HSA)..."
            className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center">
          <Newspaper className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <div className="text-sm font-bold text-stone-700">Không tìm thấy bài viết phù hợp</div>
          <p className="text-xs text-stone-400 mt-1 mb-3">
            {showSavedOnly
              ? 'Bạn chưa lưu bài viết nào. Hãy bấm biểu tượng Bookmark trên các bài báo để lưu lại đọc sau.'
              : 'Hãy thử xóa từ khóa tìm kiếm hoặc chọn danh mục khác.'}
          </p>
          {(searchQuery || showSavedOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSavedOnly(false);
                setSelectedCategory('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-xs hover:bg-black"
            >
              Xem tất cả bài viết
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => {
            const isSaved = savedArticleIds.includes(article.id);
            return (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedArticle(article)}
                className="group cursor-pointer rounded-3xl bg-white border border-stone-200 p-5 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata & bookmark button */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${article.colorScheme.badgeBg} ${article.colorScheme.badgeText}`}
                      >
                        <span>{article.icon}</span>
                        <span>{article.categoryLabel}</span>
                      </span>

                      {article.isHot && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <Flame className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                          <span>Mới</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(article.id, e)}
                      className={`p-1.5 rounded-xl transition-all ${
                        isSaved
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                          : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                      }`}
                      title={isSaved ? 'Bỏ lưu bài viết' : 'Lưu bài viết này'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-base font-bold text-stone-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Source & Read time & CTA */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="truncate max-w-[130px] font-medium text-stone-500">
                    {article.source}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{article.readTimeMinutes}p đọc</span>
                    </span>
                    <span className="inline-flex items-center text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Article Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-stone-100 flex items-start justify-between gap-3 bg-stone-50/60">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedArticle.colorScheme.badgeBg} ${selectedArticle.colorScheme.badgeText}`}
                    >
                      <span>{selectedArticle.icon}</span>
                      <span>{selectedArticle.categoryLabel}</span>
                    </span>
                    <span className="text-[11px] text-stone-500">{selectedArticle.publishedAt}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] font-medium text-stone-600">{selectedArticle.source}</span>
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-stone-900 leading-snug">
                    {selectedArticle.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-stone-700 leading-relaxed">
                {/* Lead highlight */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 font-medium leading-relaxed">
                  {selectedArticle.content.lead}
                </div>

                {/* Paragraphs */}
                <div className="space-y-3">
                  {selectedArticle.content.paragraphs.map((para, idx) => (
                    <p key={idx} className="text-stone-800 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Key takeaways callout */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs md:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Điểm then chốt 2K9 cần ghi nhớ:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {selectedArticle.content.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold select-none">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Official advice box */}
                {selectedArticle.content.officialAdvice && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs">
                    <span className="font-bold">Lời khuyên cho sĩ tử: </span>
                    <span>{selectedArticle.content.officialAdvice}</span>
                  </div>
                )}

                {/* Tags */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-stone-400 font-medium">Chủ đề:</span>
                  {selectedArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(selectedArticle.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      savedArticleIds.includes(selectedArticle.id)
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {savedArticleIds.includes(selectedArticle.id) ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Đã lưu bài viết</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                        <span>Lưu bài viết này</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyTitle(selectedArticle)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-stone-600 hover:text-stone-900 border border-stone-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>{copiedLink ? 'Đã sao chép!' : 'Chia sẻ'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
