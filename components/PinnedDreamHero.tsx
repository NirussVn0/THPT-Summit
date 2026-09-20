'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Edit3, Flame, Award, BookOpen, Compass, CheckCircle2 } from 'lucide-react';
import { UserProfile, StudyStats } from '@/types/exam';
import { playChimeSound } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface PinnedDreamHeroProps {
  profile: UserProfile;
  stats: StudyStats;
  onEditGoal: () => void;
  onDailyCheckIn: () => void;
}

const THEME_STYLES = {
  lavender: {
    heroBg: 'bg-gradient-to-br from-purple-50/90 via-[#FAF5FF] to-pink-50/60',
    border: 'border-purple-200/70',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    accentText: 'text-purple-900',
    subText: 'text-purple-700/80',
    pill: 'bg-purple-600 text-white',
    ring: 'focus:ring-purple-400',
  },
  rose: {
    heroBg: 'bg-gradient-to-br from-rose-50/90 via-[#FFF1F2] to-amber-50/50',
    border: 'border-rose-200/70',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    accentText: 'text-rose-950',
    subText: 'text-rose-700/80',
    pill: 'bg-rose-600 text-white',
    ring: 'focus:ring-rose-400',
  },
  sky: {
    heroBg: 'bg-gradient-to-br from-sky-50/90 via-[#F0F9FF] to-emerald-50/50',
    border: 'border-sky-200/70',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    accentText: 'text-sky-950',
    subText: 'text-sky-700/80',
    pill: 'bg-sky-600 text-white',
    ring: 'focus:ring-sky-400',
  },
  sage: {
    heroBg: 'bg-gradient-to-br from-emerald-50/90 via-[#F0FDF4] to-teal-50/50',
    border: 'border-emerald-200/70',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentText: 'text-emerald-950',
    subText: 'text-emerald-700/80',
    pill: 'bg-emerald-600 text-white',
    ring: 'focus:ring-emerald-400',
  },
  peach: {
    heroBg: 'bg-gradient-to-br from-amber-50/90 via-[#FFFBEB] to-rose-50/50',
    border: 'border-amber-200/70',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    accentText: 'text-amber-950',
    subText: 'text-amber-700/80',
    pill: 'bg-amber-600 text-white',
    ring: 'focus:ring-amber-400',
  },
};

export const PinnedDreamHero: React.FC<PinnedDreamHeroProps> = ({
  profile,
  stats,
  onEditGoal,
  onDailyCheckIn,
}) => {
  const theme = THEME_STYLES[profile.themeColor] || THEME_STYLES.lavender;
  const isCheckedInToday = stats.lastCheckInDate === new Date().toISOString().slice(0, 10);

  const handleCheckIn = () => {
    if (!isCheckedInToday) {
      playChimeSound('complete');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3 },
          colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'],
        });
      } catch {
        // ignore
      }
      onDailyCheckIn();
    }
  };

  return (
    <motion.div
      id="pinned-dream-hero-card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-3xl border shadow-xs transition-all ${theme.heroBg} ${theme.border} p-5 md:p-6 mb-6`}
    >
      {/* Decorative subtle background shapes */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-white/30 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Section: Dream University & Major */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-xs border border-stone-200/60 flex items-center justify-center text-3xl md:text-4xl select-none">
              🎓
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
              #1
            </span>
          </div>

          <div className="min-w-0 flex-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-2xs">
                <Sparkles className="w-3 h-3" />
                <span>Mục Tiêu Đã Ghim</span>
              </span>

              {profile.universityShort && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme.badge}`}>
                  <Compass className="w-3 h-3" />
                  <span>{profile.universityShort}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/80 text-stone-700 border border-stone-200/60">
                <Award className="w-3 h-3 text-amber-500" />
                <span>{profile.targetScore || 'Mục tiêu 2027'}</span>
              </span>
            </div>

            {/* University Title */}
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${theme.accentText} truncate`}>
              {profile.targetUniversity || 'Chưa thiết lập trường mơ ước'}
            </h1>

            {/* Dream Major Display */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-stone-500 font-medium">Ngành khao khát:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white shadow-2xs text-xs md:text-sm font-semibold text-stone-900 border border-stone-200/80">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>{profile.targetMajor || 'Chưa chọn ngành'}</span>
              </span>
            </div>

            {/* Motto */}
            {profile.motto && (
              <p className="mt-2 text-xs md:text-sm italic text-stone-600 flex items-center gap-1.5">
                <span className="text-rose-400 font-serif text-base leading-none">&ldquo;</span>
                <span>{profile.motto}</span>
                <span className="text-rose-400 font-serif text-base leading-none">&rdquo;</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Streak Counter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-200/60">
          {/* Daily Streak Card */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white shadow-2xs border border-stone-200/70">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Chuỗi Ôn Thi
              </div>
              <div className="text-sm font-bold text-stone-900 flex items-center gap-1">
                <span>{stats.streakDays} Ngày</span>
                <span className="text-xs text-amber-600 font-normal">liên tiếp</span>
              </div>
            </div>
          </div>

          {/* Daily Check-In Button */}
          <button
            id="btn-daily-checkin"
            type="button"
            onClick={handleCheckIn}
            disabled={isCheckedInToday}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all ${
              isCheckedInToday
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-300/80 shadow-2xs hover:shadow-xs active:scale-98'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCheckedInToday ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>{isCheckedInToday ? 'Đã điểm danh hôm nay' : 'Điểm danh hôm nay 🔥'}</span>
          </button>

          {/* Edit Goals Trigger Button */}
          <button
            id="btn-edit-pinned-goal"
            type="button"
            onClick={onEditGoal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-stone-700 bg-white/90 hover:bg-white border border-stone-200 shadow-2xs hover:shadow-xs transition-all active:scale-98"
            title="Đổi trường, ngành học hoặc mục tiêu"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>Đổi mục tiêu</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
