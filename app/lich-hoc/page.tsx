'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SmartStudyPlanner } from '@/components/SmartStudyPlanner';
import { useStudyStorage } from '@/lib/useStudyStorage';
import {
  CalendarDays,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  Wand2,
  Plus,
} from 'lucide-react';

export default function StudyPlannerPage() {
  const {
    isLoaded,
    profile,
    tasks,
    stats,
    liveLearnerCount,
    updateProfile,
    updateTasks,
    handleTaskCompleted,
    handleResetData,
  } = useStudyStorage();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Overall weekly task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-stone-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-purple-600 rounded-full animate-spin" />
          <span>Đang tải Lập Lịch Học Tập Thông Minh 2K9...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        stats={stats}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetData={handleResetData}
        liveLearnerCount={liveLearnerCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Trang Chủ
            </Link>
            <span>/</span>
            <span className="font-semibold text-purple-700">Lịch Học Thông Minh 2K9</span>
          </div>

          <Link
            href="/pomodoro"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all shadow-2xs"
          >
            <span>🍅</span>
            <span>Trạm Pomodoro (Tự sync lịch)</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hero Banner for Planner Page */}
        <div className="mb-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3 backdrop-blur-xs">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>Mục tiêu: {profile.targetUniversity} ({profile.targetMajor})</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Lập Lịch Học Tập Thông Minh 2K9
              </h1>
              <p className="text-white/85 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed">
                Phân bổ thời gian khoa học cho từng môn học trong tuần. Kết hợp hài hòa giữa kiến thức THPTQG 2027 và kỹ năng tư duy ĐGNL V-ACT, HSA, TSA.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 text-center">
                <div className="text-[11px] text-white/80 font-medium">Tiến độ tuần này</div>
                <div className="text-lg md:text-xl font-mono font-extrabold text-emerald-300">
                  {completedTasks}/{totalTasks} bài ({percentComplete}%)
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 text-center">
                <div className="text-[11px] text-white/80 font-medium">Điểm kỳ vọng</div>
                <div className="text-sm md:text-base font-bold text-amber-200 mt-1">
                  {profile.targetScore || '27.5+'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Full Width Smart Study Planner */}
        <div className="mb-8">
          <SmartStudyPlanner
            tasks={tasks}
            profile={profile}
            onUpdateTasks={updateTasks}
            onTaskCompleted={handleTaskCompleted}
          />
        </div>

        {/* Quick Launch Pomodoro Station CTA */}
        <div className="mb-8 p-5 md:p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-200/90 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 text-2xl flex items-center justify-center shadow-2xs shrink-0">
              🍅
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-rose-950">
                Bắt đầu ca ôn luyện ngay với Trạm Pomodoro 2K9
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Trạm Pomodoro tự động nhận diện nhiệm vụ của hôm nay, ghi nhận phút học và tự động tích hoàn thành khi đạt đủ thời lượng.
              </p>
            </div>
          </div>

          <Link
            href="/pomodoro"
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0"
          >
            <span>Bật Trạm Pomodoro</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Onboarding Modal if user wants to change goals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={profile}
        onSave={updateProfile}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/70 py-6 bg-white/60 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium text-stone-700">
            <span>Sĩ Tử 2027</span>
            <span>•</span>
            <Link href="/" className="hover:text-stone-900">Trang chủ</Link>
            <span>•</span>
            <span className="text-purple-700 font-semibold">Lịch học 2K9</span>
            <span>•</span>
            <Link href="/pomodoro" className="hover:text-stone-900">Trạm Pomodoro</Link>
          </div>
          <div>Bứt phá kỳ thi 2027 • Kỷ luật hôm nay, đại học ngày mai</div>
        </div>
      </footer>
    </div>
  );
}
