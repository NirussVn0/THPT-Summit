'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { PomodoroWidget } from '@/components/PomodoroWidget';
import { useStudyStorage } from '@/lib/useStudyStorage';
import {
  CalendarDays,
  Brain,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  Coffee,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function PomodoroPage() {
  const {
    isLoaded,
    profile,
    tasks,
    stats,
    liveLearnerCount,
    updateProfile,
    updateTasks,
    handleSessionCompleted,
    handleResetData,
  } = useStudyStorage();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Today's tasks
  const currentDayOfWeek = new Date().getDay();
  const todayTasks = tasks.filter((t) => t.dayOfWeek === currentDayOfWeek);
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-stone-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-rose-600 rounded-full animate-spin" />
          <span>Đang mở Trạm Tập Trung Pomodoro...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        stats={stats}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetData={handleResetData}
        liveLearnerCount={liveLearnerCount}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Trang Chủ
            </Link>
            <span>/</span>
            <span className="font-semibold text-rose-700">Trạm Pomodoro 2K9</span>
          </div>

          <Link
            href="/lich-hoc"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all shadow-2xs"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Mở Lịch Học 2K9</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hero Banner of Pomodoro Station */}
        <div className="mb-6 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3 backdrop-blur-xs">
                <span>🍅 Phương pháp Pomodoro & Chu kỳ Não Bộ</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Trạm Tập Trung Pomodoro 2K9
              </h1>
              <p className="text-white/85 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
                Tối ưu hóa khả năng ghi nhớ dài hạn, rèn sức bền tâm lý 25p – 50p – 90p – 150p và tự động đồng bộ tiến độ vào thời khóa biểu hôm nay.
              </p>
            </div>

            {/* Quick Stat Pill */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 text-center">
                <div className="text-[11px] text-white/80 font-medium">Tổng giờ học sâu</div>
                <div className="text-lg md:text-xl font-mono font-extrabold text-white">
                  {Math.floor((stats.totalFocusMinutes || 0) / 60)}h {(stats.totalFocusMinutes || 0) % 60}p
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 text-center">
                <div className="text-[11px] text-white/80 font-medium">Kỷ luật liên tục</div>
                <div className="text-lg md:text-xl font-mono font-extrabold text-amber-200 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{stats.streakDays} ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Dedicated Pomodoro Station */}
        <div className="mb-8">
          <PomodoroWidget
            tasks={tasks}
            onUpdateTasks={updateTasks}
            onSessionCompleted={handleSessionCompleted}
            isStandaloneSection={true}
          />
        </div>

        {/* Today's Synced Schedule Section */}
        <div className="mb-8 bg-white rounded-3xl border border-stone-200 shadow-xs p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm md:text-base font-bold text-stone-900">
                  Lịch Ôn Hôm Nay ({todayTasks.length} ca học)
                </h2>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                  Đã xong {completedTodayCount}/{todayTasks.length}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Các hiệp Pomodoro bạn vừa hoàn thành sẽ tự động tích lũy phút học vào các môn này
              </p>
            </div>

            <Link
              href="/lich-hoc"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 self-start sm:self-center"
            >
              <span>Chỉnh sửa toàn bộ lịch 7 ngày</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-stone-50/70 border border-dashed border-stone-200">
              <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-stone-700">
                Chưa có buổi học nào được xếp lịch hôm nay!
              </div>
              <p className="text-xs text-stone-400 mt-1 mb-3">
                Bạn vẫn có thể tự do bấm giờ Pomodoro hoặc sang Lập Lịch Học Tập để thêm bài mới.
              </p>
              <Link
                href="/lich-hoc"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
              >
                + Lên lịch học hôm nay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    t.completed
                      ? 'bg-stone-50/80 border-stone-200 text-stone-400'
                      : 'bg-white border-stone-200 hover:border-purple-300 shadow-2xs'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200">
                        {t.subject}
                      </span>
                      {t.examTarget && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/80">
                          {t.examTarget}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{t.timeSlot}</span>
                      </span>
                    </div>

                    <div className={`text-xs md:text-sm font-semibold ${t.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                      {t.title}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-500">
                      <span>Tiến độ:</span>
                      <strong className="text-purple-700 font-mono">
                        {t.loggedFocusMinutes || 0}/{t.durationMinutes} phút
                      </strong>
                      {t.completed && (
                        <span className="text-emerald-600 font-bold ml-auto flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hoàn thành</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4 Pillars of High-Stakes Exam Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm mb-2">
              🧠
            </div>
            <h3 className="text-xs font-bold text-stone-900 mb-1">
              Độ Sâu Tư Duy Não Bộ
            </h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Mất 10-15 phút để não đạt trạng thái tập trung sâu (Flow state). Hạn chế cầm điện thoại để không ngắt quãng tư duy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-2">
              ☕
            </div>
            <h3 className="text-xs font-bold text-stone-900 mb-1">
              Giải Lao Chủ Động
            </h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              5-10 phút nghỉ ngơi: Đứng dậy, uống nước, nhìn xa 20 mét để giải tỏa áp lực võng mạc và hồi phục acetylcholine.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-2">
              🎯
            </div>
            <h3 className="text-xs font-bold text-stone-900 mb-1">
              Mô Phỏng Phòng Thi Thật
            </h3>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Dùng preset 90 phút (THPT) hoặc 150 phút (V-ACT) khi giải đề thi thử để cơ thể quen dần áp lực giờ giấc.
            </p>
          </div>
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
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium text-stone-700">
            <span>Sĩ Tử 2027</span>
            <span>•</span>
            <Link href="/" className="hover:text-stone-900">Trang chủ</Link>
            <span>•</span>
            <Link href="/lich-hoc" className="hover:text-stone-900">Lịch học 2K9</Link>
            <span>•</span>
            <span className="text-rose-600 font-semibold">Trạm Pomodoro</span>
          </div>
          <div>Bứt phá kỳ thi 2027 • Kỷ luật hôm nay, đại học ngày mai</div>
        </div>
      </footer>
    </div>
  );
}
