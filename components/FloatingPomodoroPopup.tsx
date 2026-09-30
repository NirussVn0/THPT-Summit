'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronUp,
  ChevronDown,
  X,
  Timer,
  Maximize2,
  ExternalLink,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  SkipForward,
} from 'lucide-react';
import { useGlobalPomodoro, PomodoroTimerMode } from '@/lib/pomodoroState';
import { StudyTask } from '@/types/exam';
import { DAYS_OF_WEEK } from '@/lib/constants';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const FloatingPomodoroPopup: React.FC = () => {
  const {
    state,
    start,
    pause,
    toggle,
    reset,
    switchMode,
    completeAndAdvance,
    toggleExpanded,
    toggleVisible,
    setSyncedDay,
    skip,
    dismissToast,
  } = useGlobalPomodoro();

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('si_tu_2027_tasks_v1');
        return raw ? JSON.parse(raw) : [];
      } catch {}
    }
    return [];
  });

  // Keep tasks synced on external updates
  useEffect(() => {
    const handleTasksUpdated = () => {
      try {
        const raw = localStorage.getItem('si_tu_2027_tasks_v1');
        if (raw) setTasks(JSON.parse(raw));
      } catch {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'si_tu_2027_tasks_v1' && e.newValue) {
        try {
          setTasks(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('si_tu_2027_tasks_updated', handleTasksUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('si_tu_2027_tasks_updated', handleTasksUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Auto-dismiss toast notice after 3.5s
  useEffect(() => {
    if (state.lastToastNotice) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [state.lastToastNotice, dismissToast]);

  const activeTask = tasks.find((t) => t.id === state.activeTaskId);
  const dayTasks = tasks.filter((t) => t.dayOfWeek === state.syncedDay);
  const uncompletedDayTasks = dayTasks.filter((t) => !t.completed);
  const nextTask = uncompletedDayTasks.find((t) => t.id !== state.activeTaskId);

  const currentDayLabel =
    DAYS_OF_WEEK.find((d) => d.day === state.syncedDay)?.label || `Thứ ${state.syncedDay + 1}`;

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.max(0, ((state.totalSeconds - state.timeLeft) / (state.totalSeconds || 1)) * 100)
  );

  // If hidden/dismissed and no active toast notification, render nothing so workspace remains 100% clean
  if (!state.isVisible && !state.lastToastNotice) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-3 sm:right-6 z-50 flex flex-col items-end max-w-[calc(100vw-24px)] select-none pointer-events-none">
      {/* Toast Notice Bubble */}
      <AnimatePresence>
        {state.lastToastNotice && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-2 max-w-sm px-3.5 py-2.5 rounded-2xl bg-stone-900/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md border border-stone-700/80 flex items-center justify-between gap-2.5 pointer-events-auto"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🍅</span>
              <span className="line-clamp-2 leading-relaxed text-stone-100">{state.lastToastNotice}</span>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              className="text-stone-400 hover:text-white shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Popup Cards (rendered only when isVisible is true) */}
      {state.isVisible && (
        <div className="flex flex-col items-end pointer-events-auto">

      {/* Expanded Mini Popup Card */}
      <AnimatePresence>
        {state.isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-2.5 w-[330px] sm:w-[360px] bg-white/98 backdrop-blur-xl rounded-3xl border border-purple-200/90 shadow-2xl overflow-hidden text-stone-800"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 via-rose-50/50 to-amber-50/40 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  🍅
                </span>
                <div>
                  <h4 className="text-xs font-black text-stone-900 tracking-tight">
                    Trạm Pomodoro Popup
                  </h4>
                  <p className="text-[10px] text-purple-700 font-semibold">
                    {currentDayLabel} • Đang đồng bộ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href="/phong-hoc?tab=pomodoro"
                  className="p-1.5 text-stone-500 hover:text-purple-700 rounded-lg hover:bg-white/80 transition-colors"
                  title="Mở toàn màn hình tại Phòng Học"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleExpanded(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-white/80 transition-colors"
                  title="Thu nhỏ thành thanh nổi"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisible(false)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Ẩn popup (đồng hồ vẫn đếm ngầm, mở lại từ thanh Menu)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5">
              {/* Mode Selector */}
              <div className="flex items-center p-1 bg-stone-100/90 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => switchMode('focus', 25)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                    state.mode === 'focus'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tập trung (25p)
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('shortBreak', 5)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                    state.mode === 'shortBreak'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Nghỉ ngắn (5p)
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('longBreak', 15)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                    state.mode === 'longBreak'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Nghỉ dài (15p)
                </button>
              </div>

              {/* Day Selector Strip in Popup */}
              <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100/90 rounded-2xl no-scrollbar">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = state.syncedDay === d.day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setSyncedDay(d.day)}
                      className={`flex-1 py-1 px-1 rounded-xl text-[11px] font-bold transition-all text-center shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                      }`}
                      title={`Đồng bộ bài học ${d.label}`}
                    >
                      {d.label === 'Chủ Nhật' ? 'CN' : d.label.replace('Thứ ', 'T')}
                    </button>
                  );
                })}
              </div>

              {/* Big Clock Display with Progress Bar */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-5xl font-mono font-black tracking-tight text-stone-900 select-none flex items-center gap-1">
                  <span>{formatTime(state.timeLeft)}</span>
                  {state.isRunning && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-stone-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${
                      state.mode === 'focus'
                        ? 'bg-gradient-to-r from-purple-500 to-rose-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Synchronized Task Box */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-extrabold text-purple-900 flex items-center gap-1">
                    <span>🎯 Ca học đang đồng bộ:</span>
                  </span>
                  {activeTask?.subject && (
                    <span className="font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px]">
                      {activeTask.subject}
                    </span>
                  )}
                </div>

                {activeTask ? (
                  <div>
                    <div className="text-xs font-extrabold text-stone-900 line-clamp-1">
                      {activeTask.title}
                    </div>
                    {activeTask.examTarget && (
                      <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <span>Mục tiêu: {activeTask.examTarget}</span>
                        <span>• {activeTask.durationMinutes} phút</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => completeAndAdvance()}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all hover:scale-101 active:scale-98"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xong ca này ➔ Qua bài tiếp theo</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 py-1">
                    {state.activeExamTarget ? (
                      <span>Đang học theo mục tiêu {state.activeExamTarget}</span>
                    ) : (
                      <span>Chưa chọn ca học cụ thể cho ngày này.</span>
                    )}
                  </div>
                )}

                {/* Next task preview */}
                {nextTask && (
                  <div className="mt-2 pt-2 border-t border-stone-200/70 text-[11px] text-stone-500 flex items-center gap-1">
                    <span className="font-bold text-stone-700">Kế tiếp:</span>
                    <span className="truncate">{nextTask.title}</span>
                  </div>
                )}
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggle}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-extrabold shadow-sm transition-all hover:scale-102 active:scale-98 ${
                    state.isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-stone-900 hover:bg-black text-white'
                  }`}
                >
                  {state.isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Tiếp tục học</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => skip(false)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all hover:scale-102 active:scale-98"
                  title={state.mode === 'focus' ? 'Bỏ qua hiệp học ➔ Chuyển sang Nghỉ ngơi' : 'Bỏ qua giờ nghỉ ➔ Quay lại Tập trung'}
                >
                  <SkipForward className="w-4 h-4 text-amber-700" />
                  <span>{state.mode === 'focus' ? 'Skip: Nghỉ' : 'Skip: Học'}</span>
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Đặt lại phiên"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Compact Floating Dock Pill */}
      <motion.div
        layout
        className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-full border shadow-xl backdrop-blur-md transition-all ${
          state.isRunning
            ? 'bg-white/95 border-rose-400/90 ring-4 ring-rose-500/10'
            : 'bg-white/95 border-stone-200/90'
        }`}
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={toggle}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 shrink-0 ${
            state.isRunning
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-stone-900 hover:bg-stone-800 text-white'
          }`}
          title={state.isRunning ? 'Tạm dừng đồng hồ Pomodoro' : 'Tiếp tục chạy đồng hồ Pomodoro'}
        >
          {state.isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 fill-white translate-x-0.5" />
          )}
        </button>

        {/* Live Timer & Target Info */}
        <div
          onClick={() => toggleExpanded()}
          className="flex items-center gap-2 cursor-pointer pr-1 hover:opacity-80 transition-opacity"
          title="Nhấn để mở rộng đồng hồ Pomodoro"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm sm:text-base text-stone-900 tabular-nums">
                {formatTime(state.timeLeft)}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                  state.mode === 'focus'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {state.mode === 'focus' ? 'Focus' : 'Break'}
              </span>
            </div>
            <div className="text-[10px] text-stone-500 font-medium truncate max-w-[140px] sm:max-w-[200px]">
              {activeTask
                ? `${activeTask.subject}: ${activeTask.title}`
                : state.activeExamTarget || 'Đang đồng bộ Pomodoro'}
            </div>
          </div>
        </div>

        {/* Quick Skip button on Dock Pill */}
        <button
          type="button"
          onClick={() => skip(false)}
          className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
          title={state.mode === 'focus' ? 'Skip: Chuyển qua Nghỉ ngơi' : 'Skip: Quay lại Tập trung'}
        >
          <SkipForward className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">{state.mode === 'focus' ? 'Nghỉ' : 'Học'}</span>
        </button>

        {/* Quick "Xong bài" button right on the pill */}
        {activeTask && (
          <button
            type="button"
            onClick={() => completeAndAdvance()}
            className="hidden sm:inline-flex items-center gap-1 py-1.5 px-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80 text-[11px] font-bold transition-all hover:scale-102 active:scale-98 shrink-0"
            title="Đánh dấu xong bài này và tự động nhảy sang bài tiếp theo"
          >
            <Check className="w-3 h-3 text-purple-700" />
            <span>Xong bài</span>
          </button>
        )}

        {/* Expand / Minimize Toggle */}
        <button
          type="button"
          onClick={() => toggleExpanded()}
          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          title={state.isExpanded ? 'Thu gọn' : 'Mở rộng chi tiết'}
        >
          {state.isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {/* Dismiss / Close button */}
        <button
          type="button"
          onClick={() => toggleVisible(false)}
          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          title="Tạm ẩn đồng hồ (vẫn tiếp tục đếm giờ ngầm)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
        </div>
      )}
    </div>
  );
};
