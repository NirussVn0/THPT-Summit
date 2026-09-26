'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SmartStudyPlanner } from '@/components/SmartStudyPlanner';
import { PomodoroWidget } from '@/components/PomodoroWidget';
import { ReminderNotificationCenter } from '@/components/ReminderNotificationCenter';
import { DailyTipsWidget } from '@/components/DailyTipsWidget';
import { useStudyStorage } from '@/lib/useStudyStorage';
import {
  CalendarDays,
  Sparkles,
  ArrowRight,
  BookOpen,
  BellRing,
  ExternalLink,
  Target,
  Layers,
} from 'lucide-react';

export default function PhongHocPage() {
  const {
    isLoaded,
    profile,
    tasks,
    reminders,
    stats,
    liveLearnerCount,
    updateProfile,
    updateTasks,
    updateReminders,
    handleSessionCompleted,
    handleTaskCompleted,
    handleResetData,
  } = useStudyStorage();

  const [activeTab, setActiveTab] = useState<'pomodoro' | 'planner' | 'reminders' | 'all'>('pomodoro');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Today's tasks count
  const currentDayOfWeek = new Date().getDay();
  const todayTasks = tasks.filter((t) => t.dayOfWeek === currentDayOfWeek);
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-stone-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-purple-600 rounded-full animate-spin" />
          <span>Đang vào Phòng Học 2K9...</span>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-5">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Tổng Quan
          </Link>
          <span>/</span>
          <span className="font-semibold text-purple-700">Phòng Học 2K9</span>
        </div>

        {/* Hero Banner for Phòng Học */}
        <div className="mb-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-purple-950 to-indigo-950 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-bold mb-3 backdrop-blur-xs border border-white/10">
                <BookOpen className="w-3.5 h-3.5 text-purple-300" />
                <span>Không Gian Phòng Học Hợp Nhất 2K9</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Phòng Tự Học Sĩ Tử 2027
              </h1>
              <p className="text-stone-300 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed">
                Nơi tích hợp trọn gói 3 công cụ kỷ luật đắc lực: Trạm Pomodoro tập trung cao độ, Lập Lịch Học Tập Thông Minh 7 ngày và Chuông Báo nhắc nhở ca học.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
                <div className="text-[11px] text-stone-400 font-medium">Hôm nay</div>
                <div className="text-base md:text-lg font-mono font-extrabold text-emerald-300">
                  {completedTodayCount}/{todayTasks.length} ca học
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
                <div className="text-[11px] text-stone-400 font-medium">Thời gian học sâu</div>
                <div className="text-base md:text-lg font-mono font-extrabold text-amber-300">
                  {Math.floor((stats.totalFocusMinutes || 0) / 60)}h {(stats.totalFocusMinutes || 0) % 60}p
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher inside Phòng Học */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white/80 p-2 rounded-3xl border border-stone-200 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pomodoro')}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 border ${
                activeTab === 'pomodoro'
                  ? 'bg-white text-rose-700 shadow-2xs border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 border-transparent'
              }`}
            >
              <span className="text-base leading-none">🍅</span>
              <span>Trạm Pomodoro</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 border ${
                activeTab === 'planner'
                  ? 'bg-white text-purple-700 shadow-2xs border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 border-transparent'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-purple-600" />
              <span>Lịch Học 2K9</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 border ${
                activeTab === 'reminders'
                  ? 'bg-white text-amber-700 shadow-2xs border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 border-transparent'
              }`}
            >
              <BellRing className="w-4 h-4 text-amber-600" />
              <span>Chuông Báo & Nhắc Nhở</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'all' ? 'pomodoro' : 'all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-xs border-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border-transparent'
              }`}
              title="Xem đồng thời cả Pomodoro, Lịch học và Chuông báo"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeTab === 'all' ? 'Chế độ phân mục' : 'Hợp nhất toàn bộ'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: POMODORO STATION */}
        {activeTab === 'pomodoro' && (
          <div className="space-y-6 mb-8 max-w-4xl mx-auto">
            <PomodoroWidget
              tasks={tasks}
              onUpdateTasks={updateTasks}
              onSessionCompleted={handleSessionCompleted}
              isStandaloneSection={true}
            />

            {/* Quick banner to switch to planner */}
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs md:text-sm font-bold text-purple-950">
                    Muốn chỉnh sửa hoặc thêm bài học mới vào lịch 7 ngày?
                  </div>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Chuyển sang Lập Lịch Học Tập để cân bằng kiến thức THPTQG 2027 và kỹ năng ĐGNL V-ACT / HSA.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Xem Lịch Học 2K9</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SMART STUDY PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6 mb-8">
            <SmartStudyPlanner
              tasks={tasks}
              profile={profile}
              onUpdateTasks={updateTasks}
              onTaskCompleted={handleTaskCompleted}
            />

            {/* Quick banner to switch to Pomodoro */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍅</span>
                <div>
                  <div className="text-xs md:text-sm font-bold text-rose-950">
                    Đã lên lịch xong? Bắt đầu bấm giờ học sâu với Pomodoro ngay!
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Hệ thống sẽ tự động sync và đánh dấu hoàn thành bài học khi bạn hoàn tất các hiệp Pomodoro.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('pomodoro')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>Bật Trạm Pomodoro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: REMINDERS & NOTIFICATIONS */}
        {activeTab === 'reminders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
            <ReminderNotificationCenter
              reminders={reminders}
              onUpdateReminders={updateReminders}
            />
            <DailyTipsWidget />
          </div>
        )}

        {/* TAB 4: ALL-IN-ONE MERGED VIEW */}
        {activeTab === 'all' && (
          <div className="space-y-8 mb-8">
            {/* Top row: Pomodoro + Reminders side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <PomodoroWidget
                tasks={tasks}
                onUpdateTasks={updateTasks}
                onSessionCompleted={handleSessionCompleted}
                isStandaloneSection={true}
              />
              <ReminderNotificationCenter
                reminders={reminders}
                onUpdateReminders={updateReminders}
              />
            </div>

            {/* Bottom row: Full Width Smart Study Planner */}
            <div>
              <SmartStudyPlanner
                tasks={tasks}
                profile={profile}
                onUpdateTasks={updateTasks}
                onTaskCompleted={handleTaskCompleted}
              />
            </div>
          </div>
        )}

        {/* Tips Carousel */}
        {activeTab !== 'reminders' && <DailyTipsWidget />}
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
            <Link href="/" className="hover:text-stone-900">Tổng quan</Link>
            <span>•</span>
            <span className="text-purple-700 font-semibold">Phòng học</span>
          </div>
          <div>Bứt phá kỳ thi 2027 • Kỷ luật hôm nay, đại học ngày mai</div>
        </div>
      </footer>
    </div>
  );
}
