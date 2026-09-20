'use client';

import React from 'react';
import { Sparkles, Edit3, Flame, Volume2 } from 'lucide-react';
import { UserProfile, StudyStats } from '@/types/exam';
import { playChimeSound } from '@/lib/constants';

interface NavbarProps {
  profile: UserProfile;
  stats: StudyStats;
  onOpenOnboarding: () => void;
  onResetData: () => void;
  liveLearnerCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  stats,
  onOpenOnboarding,
  liveLearnerCount = 1482,
}) => {
  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="w-full bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-30 border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-200 via-rose-100 to-amber-100 border border-stone-200/80 flex items-center justify-center text-xl shadow-2xs">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-base md:text-lg tracking-tight">
                Sĩ Tử 2027
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200/70">
                <Sparkles className="w-2.5 h-2.5" />
                2K9 Bứt Phá
              </span>
            </div>
            <div className="text-[11px] text-stone-500 hidden sm:block">
              {currentDateStr} • Đếm ngược THPTQG, V-ACT & HSA
            </div>
          </div>
        </div>

        {/* Right: Quick Controls & Goal shortcut & Author Link & Live Learners */}
        <div className="flex items-center gap-2">
          {/* Live Active Learners Badge */}
          <a
            href="#live-study-room-section"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all shadow-2xs group"
            title="Xem phòng tự học trực tuyến: Sĩ tử 2K9 đang cùng ôn bài!"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold">{liveLearnerCount.toLocaleString('vi-VN')}</span>
            <span className="hidden sm:inline text-emerald-700 font-medium text-[11px]">đang học</span>
          </a>

          {/* Author Badge */}
          <a
            href="https://github.com/NIrussVn0"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100/90 hover:bg-stone-200/80 text-stone-700 hover:text-stone-900 border border-stone-200 text-xs font-semibold transition-all shadow-2xs"
            title="Tác giả / Developer: NirussVn0 (GitHub: @NIrussVn0)"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="text-[11px] font-mono text-stone-800">NirussVn0</span>
          </a>

          {/* Flame streak */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-900 shadow-2xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{stats.streakDays}</span>
            <span className="text-[11px] font-normal text-amber-700 hidden lg:inline">ngày ôn</span>
          </div>

          {/* Edit Goals Pin button */}
          <button
            id="nav-btn-edit-goal"
            type="button"
            onClick={onOpenOnboarding}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-2xs hover:shadow-xs transition-all active:scale-98"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">
              {profile.universityShort ? `Mục tiêu: ${profile.universityShort}` : 'Ghim NV1'}
            </span>
            <span className="sm:hidden">Mục tiêu</span>
          </button>

          {/* Reset / Test Audio */}
          <button
            type="button"
            onClick={() => playChimeSound('complete')}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-white border border-transparent hover:border-stone-200 transition-colors"
            title="Thử chuông truyền cảm hứng"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
