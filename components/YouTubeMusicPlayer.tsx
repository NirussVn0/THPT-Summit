'use client';

import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  ExternalLink,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Radio,
  Coffee,
  CloudRain,
  Brain,
} from 'lucide-react';

interface MusicPreset {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  icon: string;
  color: string;
}

const POPULAR_STUDY_PRESETS: MusicPreset[] = [
  {
    id: 'lofi-girl',
    title: 'Lofi Girl Live 24/7',
    description: 'Beats to relax/study to',
    youtubeId: 'jfKfPfyJRdk',
    icon: '🎧',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-200 text-purple-900',
  },
  {
    id: 'lofi-rain',
    title: 'Lofi Mưa Đêm Chill',
    description: 'Tiếng mưa êm dịu tập trung',
    youtubeId: '5yx6BWlEVcY',
    icon: '🌧️',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-200 text-blue-900',
  },
  {
    id: 'piano-classical',
    title: 'Piano Cổ Điển Kích Thích Não',
    description: 'Baroque & Classical study music',
    youtubeId: '4xDzrJKXOOY',
    icon: '🎹',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-200 text-amber-900',
  },
  {
    id: 'alpha-waves',
    title: 'Sóng Não Alpha (Deep Focus)',
    description: 'Tăng cường tập trung sâu 14Hz',
    youtubeId: 'WPni755-Krg',
    icon: '🧠',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-200 text-emerald-900',
  },
  {
    id: 'coffee-shop',
    title: 'Tiệm Cà Phê Học Bài',
    description: 'Không gian quán cà phê ấm cúng',
    youtubeId: 'h2zkV-l_TbY',
    icon: '☕',
    color: 'from-stone-500/20 to-amber-500/20 border-stone-200 text-stone-900',
  },
];

const STORAGE_KEY_YT_ID = 'si_tu_2027_yt_music_id_v1';
const STORAGE_KEY_YT_COLLAPSED = 'si_tu_2027_yt_music_collapsed_v1';

function extractYouTubeId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // If already 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard youtube.com, youtu.be, youtube.com/embed, youtube.com/live
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([^"&?\/\s]{11})/i
  );

  return match && match[1] ? match[1] : null;
}

export const YouTubeMusicPlayer: React.FC = () => {
  const [youtubeId, setYoutubeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEY_YT_ID) || 'jfKfPfyJRdk'; // Default to Lofi Girl
      } catch {}
    }
    return 'jfKfPfyJRdk';
  });

  const [inputUrl, setInputUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEY_YT_COLLAPSED) === 'true';
      } catch {}
    }
    return false;
  });

  const currentPreset = POPULAR_STUDY_PRESETS.find((p) => p.youtubeId === youtubeId);

  const handleSelectPreset = (p: MusicPreset) => {
    setYoutubeId(p.youtubeId);
    setIsPlaying(true);
    try {
      localStorage.setItem(STORAGE_KEY_YT_ID, p.youtubeId);
    } catch {}
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(inputUrl);
    if (id) {
      setYoutubeId(id);
      setIsPlaying(true);
      setInputUrl('');
      try {
        localStorage.setItem(STORAGE_KEY_YT_ID, id);
      } catch {}
    } else {
      alert('Đường dẫn YouTube không hợp lệ. Vui lòng dán link video dạng https://www.youtube.com/watch?v=... hoặc https://youtu.be/...');
    }
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY_YT_COLLAPSED, String(next));
    } catch {}
  };

  return (
    <div className="rounded-3xl bg-white border border-stone-200 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="p-4 bg-gradient-to-r from-purple-50/80 via-rose-50/50 to-amber-50/40 border-b border-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs md:text-sm font-bold text-stone-900">
                Nhạc Nền Học Tập (YouTube Lo-fi & Focus)
              </h3>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đang phát
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              {currentPreset ? currentPreset.title : 'Tùy chỉnh từ link YouTube của bạn'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white/80 transition-colors"
            title={isCollapsed ? 'Mở rộng khung phát nhạc' : 'Thu gọn'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-2">
              KÊNH NHẠC TẬP TRUNG GỢI Ý CHO SĨ TỬ 2K9:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_STUDY_PRESETS.map((p) => {
                const isSelected = youtubeId === p.youtubeId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-2xs ring-2 ring-rose-300/40'
                        : 'bg-stone-50/70 border-stone-200/80 text-stone-700 hover:bg-white hover:border-purple-200'
                    }`}
                  >
                    <span className="text-lg shrink-0">{p.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate font-semibold">{p.title}</div>
                      <div className="text-[10px] text-stone-400 truncate">{p.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* YouTube Embed Player Container */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video border border-stone-800 shadow-md">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${
                isPlaying ? '1' : '0'
              }&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title="YouTube Study Music Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Custom Link Input Bar */}
          <form onSubmit={handleSubmitUrl} className="flex items-center gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Dán link YouTube bất kỳ (https://www.youtube.com/watch?v=...)"
              className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <span>Phát link này</span>
            </button>
          </form>

          {/* Tip Note */}
          <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 flex items-center justify-between gap-2">
            <span>💡 <strong>Mẹo:</strong> Nhạc không lời (Lo-fi / Baroque / Alpha) giúp tăng 20% khả năng tập trung khi học Toán và Đọc hiểu.</span>
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-stone-700 p-1 shrink-0"
              title="Mở trên trang YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
