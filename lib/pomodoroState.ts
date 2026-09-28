'use client';

import { StudyTask, StudyStats } from '@/types/exam';
import { playChimeSound, DAYS_OF_WEEK } from '@/lib/constants';
import confetti from 'canvas-confetti';

export type PomodoroTimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface GlobalPomodoroState {
  isRunning: boolean;
  mode: PomodoroTimerMode;
  timeLeft: number; // remaining seconds
  totalSeconds: number; // duration in seconds of current session
  endTimestamp: number | null; // Date.now() + timeLeft * 1000
  activeTaskId: string | null;
  activeExamTarget: string | null;
  syncedDay: number;
  isVisible: boolean; // whether the floating popup is visible on screen
  isExpanded: boolean; // whether expanded or minimized compact pill
  completedSessions: number;
  lastToastNotice?: string;
}

const STORAGE_POMODORO_GLOBAL_KEY = 'si_tu_2027_pomodoro_global_v2';
const STORAGE_SYNCED_DAY_KEY = 'si_tu_2027_synced_day_v1';
const STORAGE_TASKS_KEY = 'si_tu_2027_tasks_v1';
const STORAGE_STATS_KEY = 'si_tu_2027_stats_v1';

function getInitialSyncedDay(): number {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_SYNCED_DAY_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) return parsed;
      }
    } catch {}
  }
  return new Date().getDay();
}

const DEFAULT_STATE: GlobalPomodoroState = {
  isRunning: false,
  mode: 'focus',
  timeLeft: 25 * 60,
  totalSeconds: 25 * 60,
  endTimestamp: null,
  activeTaskId: null,
  activeExamTarget: null,
  syncedDay: 1, // Will be hydrated in getGlobalPomodoroState
  isVisible: false,
  isExpanded: false,
  completedSessions: 0,
};

let memoryState: GlobalPomodoroState = { ...DEFAULT_STATE, syncedDay: getInitialSyncedDay() };
let isInitialized = false;
let tickInterval: NodeJS.Timeout | null = null;
const listeners = new Set<(state: GlobalPomodoroState) => void>();

function getTasksFromStorage(): StudyTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasksToStorage(tasks: StudyTask[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_TASKS_KEY,
        newValue: JSON.stringify(tasks),
      })
    );
    window.dispatchEvent(new CustomEvent('si_tu_2027_tasks_updated', { detail: tasks }));
  } catch {}
}

function addFocusMinutesToStats(minutes: number) {
  if (typeof window === 'undefined' || minutes <= 0) return;
  try {
    const raw = localStorage.getItem(STORAGE_STATS_KEY);
    const stats: StudyStats = raw
      ? JSON.parse(raw)
      : {
          streakDays: 1,
          lastActiveDate: new Date().toISOString().slice(0, 10),
          totalFocusMinutes: 0,
          completedTasksCount: 0,
        };
    stats.totalFocusMinutes = (stats.totalFocusMinutes || 0) + minutes;
    stats.completedTasksCount = (stats.completedTasksCount || 0) + 1;
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_STATS_KEY,
        newValue: JSON.stringify(stats),
      })
    );
  } catch {}
}

export function getGlobalPomodoroState(): GlobalPomodoroState {
  if (!isInitialized && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_POMODORO_GLOBAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryState = { ...DEFAULT_STATE, ...parsed };

        // If it was running, recalculate remaining time from endTimestamp
        if (memoryState.isRunning && memoryState.endTimestamp) {
          const now = Date.now();
          if (now >= memoryState.endTimestamp) {
            memoryState.timeLeft = 0;
            memoryState.isRunning = false;
            memoryState.endTimestamp = null;
          } else {
            memoryState.timeLeft = Math.max(0, Math.round((memoryState.endTimestamp - now) / 1000));
          }
        }
      }
    } catch {}
    isInitialized = true;
    startGlobalTick();
  }
  return memoryState;
}

export function setGlobalPomodoroState(
  updater: Partial<GlobalPomodoroState> | ((prev: GlobalPomodoroState) => GlobalPomodoroState),
  emitEvent = true
): GlobalPomodoroState {
  const current = getGlobalPomodoroState();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };

  memoryState = next;

  if (typeof window !== 'undefined') {
    try {
      if (typeof next.syncedDay === 'number') {
        localStorage.setItem(STORAGE_SYNCED_DAY_KEY, String(next.syncedDay));
      }
      localStorage.setItem(STORAGE_POMODORO_GLOBAL_KEY, JSON.stringify(next));
      if (emitEvent) {
        window.dispatchEvent(
          new CustomEvent('si_tu_2027_pomodoro_global_sync', { detail: next })
        );
      }
    } catch {}
  }

  listeners.forEach((fn) => fn(next));

  if (next.isRunning) {
    startGlobalTick();
  } else if (!next.isRunning && tickInterval) {
    // Keep tick running if needed, or recalculate
  }

  return next;
}

function startGlobalTick() {
  if (typeof window === 'undefined') return;
  if (tickInterval) return;

  tickInterval = setInterval(() => {
    const current = memoryState;
    if (!current.isRunning || !current.endTimestamp) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.round((current.endTimestamp - now) / 1000));

    if (remaining !== current.timeLeft) {
      if (remaining <= 0) {
        // Session complete!
        handleSessionFinished();
      } else {
        setGlobalPomodoroState({ timeLeft: remaining }, true);
      }
    }
  }, 1000);
}

function handleSessionFinished() {
  const current = memoryState;
  const minutesSpent = Math.max(1, Math.round(current.totalSeconds / 60));

  playChimeSound('complete');
  try {
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
  } catch {}

  let nextNotice = '🎉 Chúc mừng! Bạn vừa hoàn thành một phiên tập trung sâu sắc!';

  // If focus session and we have an active task, complete it and advance!
  if (current.mode === 'focus') {
    addFocusMinutesToStats(minutesSpent);

    const tasks = getTasksFromStorage();
    const activeId = current.activeTaskId;
    let nextTaskId: string | null = null;

    if (activeId && tasks.some((t) => t.id === activeId)) {
      const updatedTasks = tasks.map((t) =>
        t.id === activeId
          ? {
              ...t,
              completed: true,
              loggedFocusMinutes: (t.loggedFocusMinutes || 0) + minutesSpent,
            }
          : t
      );
      saveTasksToStorage(updatedTasks);

      const targetDay = current.syncedDay;
      const uncompletedRemaining = updatedTasks.filter(
        (t) => t.dayOfWeek === targetDay && !t.completed && t.id !== activeId
      );

      if (uncompletedRemaining.length > 0) {
        nextTaskId = uncompletedRemaining[0].id;
        const currentTask = tasks.find((t) => t.id === activeId);
        nextNotice = `✓ Đã hoàn thành "${currentTask?.title || 'ca học'}"! 🚀 Tự động chuyển sang: "${uncompletedRemaining[0].title}"`;
      } else {
        const dayLabel = DAYS_OF_WEEK.find((d) => d.day === targetDay)?.label || `ngày học`;
        nextNotice = `🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ nhiệm vụ của ${dayLabel}!`;
      }
    }

    // Switch to Short Break (5 min)
    const breakSeconds = 5 * 60;
    setGlobalPomodoroState({
      isRunning: false,
      mode: 'shortBreak',
      timeLeft: breakSeconds,
      totalSeconds: breakSeconds,
      endTimestamp: null,
      activeTaskId: nextTaskId || current.activeTaskId,
      completedSessions: current.completedSessions + 1,
      lastToastNotice: nextNotice,
    });
  } else {
    // Break finished -> switch to Focus
    const focusSeconds = 25 * 60;
    setGlobalPomodoroState({
      isRunning: false,
      mode: 'focus',
      timeLeft: focusSeconds,
      totalSeconds: focusSeconds,
      endTimestamp: null,
      lastToastNotice: '⏰ Hết giờ giải lao! Hãy bắt đầu ca học mới tràn đầy năng lượng nào!',
    });
  }
}

// User Actions
export function startPomodoroTimer() {
  const current = getGlobalPomodoroState();
  const now = Date.now();
  const endTimestamp = now + current.timeLeft * 1000;

  playChimeSound('start');
  setGlobalPomodoroState({
    isRunning: true,
    endTimestamp,
    isVisible: true,
  });
}

export function pausePomodoroTimer() {
  const current = getGlobalPomodoroState();
  if (!current.isRunning) return;

  const now = Date.now();
  const remaining = current.endTimestamp
    ? Math.max(0, Math.round((current.endTimestamp - now) / 1000))
    : current.timeLeft;

  playChimeSound('click');
  setGlobalPomodoroState({
    isRunning: false,
    endTimestamp: null,
    timeLeft: remaining,
  });
}

export function togglePomodoroTimer() {
  const current = getGlobalPomodoroState();
  if (current.isRunning) {
    pausePomodoroTimer();
  } else {
    startPomodoroTimer();
  }
}

export function resetPomodoroTimer() {
  const current = getGlobalPomodoroState();
  playChimeSound('click');
  setGlobalPomodoroState({
    isRunning: false,
    endTimestamp: null,
    timeLeft: current.totalSeconds,
  });
}

export function switchPomodoroMode(mode: PomodoroTimerMode, customMinutes?: number) {
  let minutes = customMinutes || (mode === 'focus' ? 25 : mode === 'shortBreak' ? 5 : 15);
  const seconds = minutes * 60;

  playChimeSound('start');
  setGlobalPomodoroState({
    mode,
    isRunning: false,
    endTimestamp: null,
    timeLeft: seconds,
    totalSeconds: seconds,
  });
}

export function completeCurrentTaskAndAdvance() {
  const current = getGlobalPomodoroState();
  const activeId = current.activeTaskId;
  const tasks = getTasksFromStorage();

  playChimeSound('complete');
  try {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  } catch {}

  let nextNotice = '✓ Đã đánh dấu hoàn thành ca học!';
  let nextTaskId: string | null = null;

  if (activeId && tasks.some((t) => t.id === activeId)) {
    const minutesSpent = Math.max(15, Math.round((current.totalSeconds - current.timeLeft) / 60));
    const updatedTasks = tasks.map((t) =>
      t.id === activeId
        ? {
            ...t,
            completed: true,
            loggedFocusMinutes: (t.loggedFocusMinutes || 0) + minutesSpent,
          }
        : t
    );
    saveTasksToStorage(updatedTasks);
    addFocusMinutesToStats(minutesSpent);

    const targetDay = current.syncedDay;
    const uncompletedRemaining = updatedTasks.filter(
      (t) => t.dayOfWeek === targetDay && !t.completed && t.id !== activeId
    );

    if (uncompletedRemaining.length > 0) {
      nextTaskId = uncompletedRemaining[0].id;
      const currentTask = tasks.find((t) => t.id === activeId);
      nextNotice = `✓ Đã xong "${currentTask?.title || 'bài'}"! ➔ Chuyển qua "${uncompletedRemaining[0].title}"`;
    } else {
      const dayLabel = DAYS_OF_WEEK.find((d) => d.day === targetDay)?.label || 'ngày này';
      nextNotice = `🎉 Xuất sắc! Bạn đã hoàn thành hết các ca học của ${dayLabel}!`;
    }
  }

  // Reset timer to full focus session for next task
  const focusSeconds = 25 * 60;
  const now = Date.now();
  setGlobalPomodoroState({
    mode: 'focus',
    isRunning: true,
    timeLeft: focusSeconds,
    totalSeconds: focusSeconds,
    endTimestamp: now + focusSeconds * 1000,
    activeTaskId: nextTaskId || current.activeTaskId,
    lastToastNotice: nextNotice,
    isVisible: true,
  });
}

export function skipPomodoroSession(autoStart = false) {
  const current = getGlobalPomodoroState();
  playChimeSound('click');

  if (current.mode === 'focus') {
    // Determine next break: every 4 sessions is a long break (15 min), otherwise short break (5 min)
    const isLong = (current.completedSessions + 1) % 4 === 0;
    const nextMode: PomodoroTimerMode = isLong ? 'longBreak' : 'shortBreak';
    const breakSeconds = isLong ? 15 * 60 : 5 * 60;
    const now = Date.now();

    setGlobalPomodoroState({
      mode: nextMode,
      isRunning: autoStart,
      timeLeft: breakSeconds,
      totalSeconds: breakSeconds,
      endTimestamp: autoStart ? now + breakSeconds * 1000 : null,
      syncedDay: current.syncedDay,
      lastToastNotice: `⏭️ Đã bỏ qua tập trung ➔ Chuyển sang ${isLong ? 'Nghỉ dài (15p)' : 'Nghỉ ngắn (5p)'}`,
    });
  } else {
    // If currently in break (shortBreak or longBreak), skip back to focus session!
    const focusSeconds = 25 * 60;
    const now = Date.now();

    setGlobalPomodoroState({
      mode: 'focus',
      isRunning: autoStart,
      timeLeft: focusSeconds,
      totalSeconds: focusSeconds,
      endTimestamp: autoStart ? now + focusSeconds * 1000 : null,
      syncedDay: current.syncedDay,
      lastToastNotice: '⏭️ Đã bỏ qua giờ nghỉ ➔ Bắt đầu phiên Tập trung (25p)',
    });
  }
}

export function syncExamToPomodoro(examName: string, examId: string) {
  const tasks = getTasksFromStorage();
  const current = getGlobalPomodoroState();
  // Preserve currently selected syncedDay so we DO NOT jump to another day!
  const targetDay = typeof current.syncedDay === 'number' ? current.syncedDay : getInitialSyncedDay();

  // Find a matching uncompleted task for the currently active day first
  const dayTasks = tasks.filter((t) => t.dayOfWeek === targetDay);
  const examMatchingTask =
    dayTasks.find((t) => !t.completed && t.examTarget && examName.includes(t.examTarget)) ||
    dayTasks.find((t) => !t.completed) ||
    dayTasks[0];

  const now = Date.now();
  const focusSeconds = 25 * 60;

  playChimeSound('start');
  try {
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
  } catch {}

  const dayLabel = DAYS_OF_WEEK.find((d) => d.day === targetDay)?.label || `Thứ ${targetDay + 1}`;
  const notice = `🍅 Đồng hồ Pomodoro đã kích hoạt cho mục tiêu "${examName}" (${dayLabel})!`;

  setGlobalPomodoroState({
    isRunning: true,
    mode: 'focus',
    timeLeft: focusSeconds,
    totalSeconds: focusSeconds,
    endTimestamp: now + focusSeconds * 1000,
    activeTaskId: examMatchingTask ? examMatchingTask.id : null,
    activeExamTarget: examName,
    syncedDay: targetDay, // STRICTLY KEEP current day!
    isVisible: true,
    isExpanded: false, // compact pill at bottom so user can browse naturally
    lastToastNotice: notice,
  });
}

export function toggleFloatingPomodoroVisibility(forceVisible?: boolean) {
  setGlobalPomodoroState((prev) => ({
    ...prev,
    isVisible: forceVisible !== undefined ? forceVisible : !prev.isVisible,
  }));
}

export function toggleFloatingPomodoroExpanded(forceExpanded?: boolean) {
  setGlobalPomodoroState((prev) => ({
    ...prev,
    isExpanded: forceExpanded !== undefined ? forceExpanded : !prev.isExpanded,
  }));
}

export function setPomodoroSyncedDay(day: number) {
  const tasks = getTasksFromStorage();
  const dayTasks = tasks.filter((t) => t.dayOfWeek === day);
  const firstUnfinished = dayTasks.find((t) => !t.completed) || dayTasks[0];

  playChimeSound('start');
  const dayLabel = DAYS_OF_WEEK.find((d) => d.day === day)?.label || `Thứ ${day + 1}`;

  setGlobalPomodoroState({
    syncedDay: day,
    activeTaskId: firstUnfinished ? firstUnfinished.id : null,
    lastToastNotice: `🍅 Đã kết nối toàn bộ ${dayTasks.length} ca học của ${dayLabel}!`,
  });
}

export function setPomodoroActiveTask(taskId: string) {
  setGlobalPomodoroState({
    activeTaskId: taskId,
  });
}

// React hook for components
import { useState, useEffect } from 'react';

export function useGlobalPomodoro() {
  const [state, setState] = useState<GlobalPomodoroState>(() => getGlobalPomodoroState());

  useEffect(() => {
    const handleUpdate = (updatedState: GlobalPomodoroState) => {
      setState(updatedState);
    };

    listeners.add(handleUpdate);

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<GlobalPomodoroState>;
      if (custom.detail) {
        setState(custom.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_POMODORO_GLOBAL_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
        } catch {}
      }
    };

    window.addEventListener('si_tu_2027_pomodoro_global_sync', handleCustomEvent);
    window.addEventListener('storage', handleStorage);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener('si_tu_2027_pomodoro_global_sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    state,
    start: startPomodoroTimer,
    pause: pausePomodoroTimer,
    toggle: togglePomodoroTimer,
    reset: resetPomodoroTimer,
    switchMode: switchPomodoroMode,
    completeAndAdvance: completeCurrentTaskAndAdvance,
    syncExam: syncExamToPomodoro,
    toggleVisible: toggleFloatingPomodoroVisibility,
    toggleExpanded: toggleFloatingPomodoroExpanded,
    setSyncedDay: setPomodoroSyncedDay,
    setActiveTask: setPomodoroActiveTask,
    skip: skipPomodoroSession,
  };
}
