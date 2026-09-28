'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Sparkles,
  Settings2,
  Sliders,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
  Music,
  ArrowRight,
  BookOpen,
  Timer,
  Hourglass,
  Check,
  Zap,
} from 'lucide-react';
import { StudyTask, PomodoroSettings } from '@/types/exam';
import { DEFAULT_POMODORO_SETTINGS, POMODORO_PRESETS, playChimeSound, DAYS_OF_WEEK } from '@/lib/constants';
import { getGlobalPomodoroState, setGlobalPomodoroState } from '@/lib/pomodoroState';
import confetti from 'canvas-confetti';

interface PomodoroWidgetProps {
  tasks?: StudyTask[];
  onUpdateTasks?: (tasks: StudyTask[]) => void;
  onSessionCompleted?: (minutes: number) => void;
  onRunningChange?: (running: boolean) => void;
  isStandaloneSection?: boolean;
}

export type OperationalTimerType = 'pomodoro' | 'stopwatch' | 'countdown';
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const STORAGE_POMODORO_SETTINGS_KEY = 'si_tu_2027_pomodoro_settings_v1';
const STORAGE_ACTIVE_TASK_KEY = 'si_tu_2027_active_task_id_v1';

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  tasks = [],
  onUpdateTasks,
  onSessionCompleted,
  onRunningChange,
  isStandaloneSection = false,
}) => {
  // Operational mode: Pomodoro (Intervals), Stopwatch (Count-up / Đo thời gian thực), Countdown (Đếm ngược tự do)
  const [operationalType, setOperationalType] = useState<OperationalTimerType>('pomodoro');

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_POMODORO_SETTINGS_KEY);
        if (saved) {
          return { ...DEFAULT_POMODORO_SETTINGS, ...JSON.parse(saved) };
        }
      } catch {}
    }
    return DEFAULT_POMODORO_SETTINGS;
  });

  // Pomodoro state
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(() => settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Stopwatch state (Count-up: "bấm xem dành bao nhiêu thời gian cho việc đó")
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

  // Custom countdown state
  const [customCountdownMinutes, setCustomCountdownMinutes] = useState<number>(60);
  const [customCountdownLeft, setCustomCountdownLeft] = useState<number>(60 * 60);
  const [isCustomCountdownRunning, setIsCustomCountdownRunning] = useState<boolean>(false);

  // Synced Day & Task state (Auto-Sync Queue: Xong bài nào tự done và tự nhảy qua bài tiếp theo)
  const currentDayOfWeek = new Date().getDay();
  const [syncedDay, setSyncedDay] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('si_tu_2027_synced_day_v1');
        if (saved !== null) return parseInt(saved, 10);
      } catch {}
    }
    return currentDayOfWeek;
  });

  const [manualTaskId, setManualTaskId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_ACTIVE_TASK_KEY) || '';
      } catch {}
    }
    return '';
  });

  const dayTasks = tasks.filter((t) => t.dayOfWeek === syncedDay);
  const dayTasksCompleted = dayTasks.filter((t) => t.completed);
  const dayTasksUncompleted = dayTasks.filter((t) => !t.completed);

  // Determine active task ID:
  // 1. If manualTaskId belongs to dayTasks and is NOT completed, prioritize it!
  // 2. Otherwise pick the first uncompleted task in dayTasks
  // 3. If all completed in dayTasks, pick the first or last task in dayTasks
  // 4. Fallback to any uncompleted task in all tasks
  let activeTaskId = '';
  if (manualTaskId && dayTasks.some((t) => t.id === manualTaskId)) {
    const manualTask = dayTasks.find((t) => t.id === manualTaskId);
    if (manualTask && !manualTask.completed) {
      activeTaskId = manualTask.id;
    } else {
      activeTaskId = dayTasksUncompleted[0]?.id || dayTasks[0]?.id || '';
    }
  } else {
    activeTaskId =
      dayTasksUncompleted[0]?.id ||
      dayTasks[0]?.id ||
      tasks.find((t) => !t.completed)?.id ||
      tasks[0]?.id ||
      '';
  }

  const selectedTaskId = activeTaskId;
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Toast feedback message inside widget with lazy initialization
  const [feedbackToast, setFeedbackToast] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const notice = localStorage.getItem('si_tu_2027_pomodoro_sync_notice');
        if (notice) {
          localStorage.removeItem('si_tu_2027_pomodoro_sync_notice');
          return notice;
        }
        const params = new URLSearchParams(window.location.search);
        const examName = params.get('examName');
        const examTarget = params.get('examTarget');
        if (examName || examTarget) {
          return `🍅 Đã kết nối mục tiêu ${examName || examTarget} vào Trạm Pomodoro & Auto-Sync chuỗi ca học hôm nay!`;
        }
      } catch {}
    }
    return '';
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(''), 5500);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const ambientAudioRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<{ stop: () => void } | null>(null);

  // Listen for day sync queue and task sync events
  useEffect(() => {
    const handleDaySync = (e: Event) => {
      const customEvt = e as CustomEvent<{ dayOfWeek: number; dayLabel?: string; firstTaskId?: string }>;
      if (typeof customEvt.detail?.dayOfWeek === 'number') {
        const newDay = customEvt.detail.dayOfWeek;
        setSyncedDay(newDay);
        if (customEvt.detail.firstTaskId) {
          setManualTaskId(customEvt.detail.firstTaskId);
        } else {
          const dTasks = tasks.filter((t) => t.dayOfWeek === newDay);
          const uncompleted = dTasks.find((t) => !t.completed);
          if (uncompleted) setManualTaskId(uncompleted.id);
        }
        setFeedbackToast(
          `🍅 Đã kết nối chuỗi bài học ${customEvt.detail.dayLabel || ''}! Xong từng bài sẽ tự hoàn thành & nhảy bài tiếp.`
        );
        setTimeout(() => setFeedbackToast(''), 4500);
      }
    };

    const handleTaskSync = (e: Event) => {
      const customEvt = e as CustomEvent<{ taskId: string }>;
      if (customEvt.detail?.taskId) {
        setManualTaskId(customEvt.detail.taskId);
        const taskObj = tasks.find((t) => t.id === customEvt.detail.taskId);
        if (taskObj) {
          setSyncedDay(taskObj.dayOfWeek);
          setFeedbackToast(`🍅 Đã kết nối với bài học: "${taskObj.title}"`);
          setTimeout(() => setFeedbackToast(''), 4000);
        }
      }
    };

    window.addEventListener('si_tu_2027_sync_day_queue', handleDaySync);
    window.addEventListener('si_tu_2027_sync_timer_task', handleTaskSync);

    const handleGlobalPomodoroSync = (e: Event) => {
      const customEvt = e as CustomEvent<any>;
      if (customEvt.detail) {
        const g = customEvt.detail;
        if (typeof g.isRunning === 'boolean') setIsRunning(g.isRunning);
        if (typeof g.timeLeft === 'number') setTimeLeft(g.timeLeft);
        if (g.mode) setMode(g.mode);
        if (g.activeTaskId) setManualTaskId(g.activeTaskId);
        if (typeof g.syncedDay === 'number') setSyncedDay(g.syncedDay);
      }
    };
    window.addEventListener('si_tu_2027_pomodoro_global_sync', handleGlobalPomodoroSync);

    return () => {
      window.removeEventListener('si_tu_2027_sync_day_queue', handleDaySync);
      window.removeEventListener('si_tu_2027_sync_timer_task', handleTaskSync);
      window.removeEventListener('si_tu_2027_pomodoro_global_sync', handleGlobalPomodoroSync);
    };
  }, [tasks]);

  // Calculate current duration for the active mode
  const getModeDurationMinutes = React.useCallback(
    (targetMode: TimerMode): number => {
      if (targetMode === 'focus') return settings.focusMinutes;
      if (targetMode === 'shortBreak') return settings.shortBreakMinutes;
      return settings.longBreakMinutes;
    },
    [settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]
  );

  const stopAmbientSound = React.useCallback(() => {
    if (ambientNodeRef.current) {
      ambientNodeRef.current.stop();
      ambientNodeRef.current = null;
    }
    if (ambientAudioRef.current) {
      try {
        ambientAudioRef.current.close();
      } catch {}
      ambientAudioRef.current = null;
    }
  }, []);

  // Web Audio Ambient generator
  const startAmbientSound = React.useCallback((type: PomodoroSettings['ambientSound']) => {
    stopAmbientSound();
    if (type === 'none' || typeof window === 'undefined') return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      ambientAudioRef.current = ctx;

      if (type === 'whitenoise' || type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        let seed = 123456789;
        for (let i = 0; i < bufferSize; i++) {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          const white = (seed / 2147483648) - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= type === 'rain' ? 0.35 : 0.2;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();

        ambientNodeRef.current = {
          stop: () => {
            try {
              noise.stop();
              ctx.close();
            } catch {}
          },
        };
      } else if (type === 'clock') {
        const tickInterval = setInterval(() => {
          try {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            g.gain.setValueAtTime(0.02, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          } catch {}
        }, 1000);

        ambientNodeRef.current = {
          stop: () => {
            clearInterval(tickInterval);
            try {
              ctx.close();
            } catch {}
          },
        };
      }
    } catch {}
  }, [stopAmbientSound]);

  // Complete active task and automatically advance to next task in the day queue
  const handleCompleteAndAdvanceToNextTask = (targetTaskId?: string, minutesToLog?: number) => {
    const currentId = targetTaskId || selectedTaskId;
    if (!currentId || !onUpdateTasks) return;

    const currentTask = tasks.find((t) => t.id === currentId);
    if (!currentTask) return;

    const logged =
      (currentTask.loggedFocusMinutes || 0) +
      (minutesToLog || currentTask.durationMinutes || settings.focusMinutes);
    const updatedTasks = tasks.map((t) =>
      t.id === currentId ? { ...t, completed: true, loggedFocusMinutes: logged } : t
    );
    onUpdateTasks(updatedTasks);
    playChimeSound('complete');

    // Find next uncompleted task in the synced day's queue
    const remainingDayTasks = updatedTasks.filter(
      (t) => t.dayOfWeek === syncedDay && !t.completed && t.id !== currentId
    );

    if (remainingDayTasks.length > 0) {
      const nextTask = remainingDayTasks[0];
      setManualTaskId(nextTask.id);
      try {
        localStorage.setItem(STORAGE_ACTIVE_TASK_KEY, nextTask.id);
      } catch {}

      setGlobalPomodoroState({
        activeTaskId: nextTask.id,
        lastToastNotice: `✓ Đã hoàn thành "${currentTask.title}"! 🚀 Tự động chuyển qua: "${nextTask.title}"`,
      });

      if (mode === 'focus') {
        setTimeLeft(settings.focusMinutes * 60);
      }

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setFeedbackToast(
        `✓ Đã hoàn thành "${currentTask.title}"! 🚀 Tự động chuyển qua bài tiếp theo: "${nextTask.title}"`
      );
      setTimeout(() => setFeedbackToast(''), 5500);
    } else {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      } catch {}
      const dayLabel = DAYS_OF_WEEK.find((d) => d.day === syncedDay)?.label || `Thứ ${syncedDay + 1}`;
      setFeedbackToast(`🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ nhiệm vụ của ${dayLabel}!`);
      setTimeout(() => setFeedbackToast(''), 6000);
    }
  };

  const handleCompleteRef = useRef(handleCompleteAndAdvanceToNextTask);
  useEffect(() => {
    handleCompleteRef.current = handleCompleteAndAdvanceToNextTask;
  });

  // Pomodoro timer loop
  useEffect(() => {
    if (isRunning && operationalType === 'pomodoro') {
      if (settings.ambientSound !== 'none') {
        startAmbientSound(settings.ambientSound);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            stopAmbientSound();

            if (settings.soundEnabled) playChimeSound('complete');

            if (mode === 'focus') {
              const newSessionCount = completedSessions + 1;
              setCompletedSessions(newSessionCount);
              const minutesSpent = settings.focusMinutes;

              if (onSessionCompleted) onSessionCompleted(minutesSpent);

              // Auto-sync with study schedule task: Complete current task and auto-advance to next task!
              if (settings.syncWithSchedule && selectedTaskId && onUpdateTasks) {
                handleCompleteRef.current(selectedTaskId, minutesSpent);
              }

              try {
                confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
              } catch {}

              const shouldBeLongBreak = newSessionCount % settings.longBreakInterval === 0;
              const nextMode: TimerMode = shouldBeLongBreak ? 'longBreak' : 'shortBreak';
              setMode(nextMode);
              const nextSeconds = getModeDurationMinutes(nextMode) * 60;
              setTimeLeft(nextSeconds);

              if (settings.autoStartBreaks) {
                setTimeout(() => {
                  setIsRunning(true);
                  if (onRunningChange) onRunningChange(true);
                }, 1000);
              } else if (onRunningChange) {
                onRunningChange(false);
              }
            } else {
              setMode('focus');
              setTimeLeft(settings.focusMinutes * 60);
              if (settings.autoStartFocus) {
                setTimeout(() => {
                  setIsRunning(true);
                  if (onRunningChange) onRunningChange(true);
                }, 1000);
              } else if (onRunningChange) {
                onRunningChange(false);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbientSound();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isRunning,
    operationalType,
    mode,
    settings,
    completedSessions,
    selectedTaskId,
    tasks,
    onSessionCompleted,
    onUpdateTasks,
    onRunningChange,
    getModeDurationMinutes,
    startAmbientSound,
    stopAmbientSound,
  ]);

  // Stopwatch loop (Count-up: Tích lũy thời gian thực cho bài học)
  useEffect(() => {
    if (isStopwatchRunning && operationalType === 'stopwatch') {
      if (settings.ambientSound !== 'none') {
        startAmbientSound(settings.ambientSound);
      }

      stopwatchRef.current = setInterval(() => {
        setStopwatchSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
      if (operationalType === 'stopwatch') stopAmbientSound();
    }

    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [isStopwatchRunning, operationalType, settings.ambientSound, startAmbientSound, stopAmbientSound]);

  // Custom countdown loop
  useEffect(() => {
    if (isCustomCountdownRunning && operationalType === 'countdown') {
      if (settings.ambientSound !== 'none') {
        startAmbientSound(settings.ambientSound);
      }

      countdownRef.current = setInterval(() => {
        setCustomCountdownLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            setIsCustomCountdownRunning(false);
            stopAmbientSound();
            if (settings.soundEnabled) playChimeSound('complete');

            // Log minutes
            const minutesSpent = customCountdownMinutes;
            if (onSessionCompleted) onSessionCompleted(minutesSpent);

            if (selectedTaskId && onUpdateTasks) {
              const currentTask = tasks.find((t) => t.id === selectedTaskId);
              if (currentTask) {
                const updatedLoggedMinutes = (currentTask.loggedFocusMinutes || 0) + minutesSpent;
                onUpdateTasks(
                  tasks.map((t) =>
                    t.id === selectedTaskId
                      ? {
                          ...t,
                          loggedFocusMinutes: updatedLoggedMinutes,
                          completed: updatedLoggedMinutes >= currentTask.durationMinutes ? true : t.completed,
                        }
                      : t
                  )
                );
              }
            }

            try {
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            } catch {}

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (operationalType === 'countdown') stopAmbientSound();
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [
    isCustomCountdownRunning,
    operationalType,
    customCountdownMinutes,
    selectedTaskId,
    tasks,
    settings.ambientSound,
    settings.soundEnabled,
    onSessionCompleted,
    onUpdateTasks,
    startAmbientSound,
    stopAmbientSound,
  ]);

  // Save settings helper
  const handleUpdateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_POMODORO_SETTINGS_KEY, JSON.stringify(updated));
    } catch {}

    if (!isRunning) {
      if (mode === 'focus' && newSettings.focusMinutes !== undefined) {
        setTimeLeft(newSettings.focusMinutes * 60);
      } else if (mode === 'shortBreak' && newSettings.shortBreakMinutes !== undefined) {
        setTimeLeft(newSettings.shortBreakMinutes * 60);
      } else if (mode === 'longBreak' && newSettings.longBreakMinutes !== undefined) {
        setTimeLeft(newSettings.longBreakMinutes * 60);
      }
    }
  };

  const handleSelectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getModeDurationMinutes(newMode) * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (onRunningChange) onRunningChange(false);
    stopAmbientSound();
  };

  const handleApplyPreset = (preset: typeof POMODORO_PRESETS[0]) => {
    handleUpdateSettings({
      focusMinutes: preset.focusMinutes,
      shortBreakMinutes: preset.shortBreakMinutes,
      longBreakMinutes: preset.longBreakMinutes,
    });
    if (!isRunning && mode === 'focus') {
      setTimeLeft(preset.focusMinutes * 60);
    }
    playChimeSound('click');
  };

  const toggleRunPomodoro = () => {
    if (!isRunning) {
      playChimeSound('start');
    }
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (onRunningChange) onRunningChange(nextRunning);

    setGlobalPomodoroState({
      isRunning: nextRunning,
      timeLeft: timeLeft,
      totalSeconds: getModeDurationMinutes(mode) * 60,
      endTimestamp: nextRunning ? Date.now() + timeLeft * 1000 : null,
      mode: mode as any,
      activeTaskId: selectedTaskId || null,
      syncedDay: syncedDay,
    });
  };

  const handleResetPomodoro = () => {
    setIsRunning(false);
    const resetSeconds = getModeDurationMinutes(mode) * 60;
    setTimeLeft(resetSeconds);
    if (onRunningChange) onRunningChange(false);
    stopAmbientSound();
    playChimeSound('click');

    setGlobalPomodoroState({
      isRunning: false,
      timeLeft: resetSeconds,
      totalSeconds: resetSeconds,
      endTimestamp: null,
    });
  };

  // Stopwatch actions
  const toggleRunStopwatch = () => {
    if (!isStopwatchRunning) {
      playChimeSound('start');
    }
    setIsStopwatchRunning((r) => !r);
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchSeconds(0);
    stopAmbientSound();
    playChimeSound('click');
  };

  // Save Stopwatch elapsed time to active task
  const handleSaveStopwatchToTask = () => {
    if (stopwatchSeconds < 30) {
      alert('Thời gian quá ngắn (dưới 30 giây), hãy tiếp tục tập trung trước khi lưu!');
      return;
    }

    const minutesSpent = Math.max(1, Math.round(stopwatchSeconds / 60));
    setIsStopwatchRunning(false);
    stopAmbientSound();
    playChimeSound('complete');

    if (onSessionCompleted) onSessionCompleted(minutesSpent);

    if (selectedTaskId && onUpdateTasks) {
      const currentTask = tasks.find((t) => t.id === selectedTaskId);
      const updatedLoggedMinutes = (currentTask?.loggedFocusMinutes || 0) + minutesSpent;
      const isNowCompleted = currentTask
        ? updatedLoggedMinutes >= currentTask.durationMinutes || currentTask.completed
        : false;

      onUpdateTasks(
        tasks.map((t) =>
          t.id === selectedTaskId
            ? { ...t, loggedFocusMinutes: updatedLoggedMinutes, completed: isNowCompleted }
            : t
        )
      );
    }

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setFeedbackToast(`✓ Đã lưu thành công ${minutesSpent} phút vào bài học!`);
    setTimeout(() => setFeedbackToast(''), 4500);
    setStopwatchSeconds(0);
  };

  // Custom countdown actions
  const toggleRunCountdown = () => {
    if (!isCustomCountdownRunning) playChimeSound('start');
    setIsCustomCountdownRunning((r) => !r);
  };

  const handleResetCountdown = () => {
    setIsCustomCountdownRunning(false);
    setCustomCountdownLeft(customCountdownMinutes * 60);
    stopAmbientSound();
    playChimeSound('click');
  };

  const handleSelectCustomMinutes = (m: number) => {
    setCustomCountdownMinutes(m);
    setCustomCountdownLeft(m * 60);
    setIsCustomCountdownRunning(false);
    playChimeSound('click');
  };

  // Quick mark active task completed in schedule
  const handleQuickMarkTaskComplete = () => {
    handleCompleteAndAdvanceToNextTask(selectedTaskId);
  };

  // Formatted times
  // Pomodoro
  const pomodoroMinutes = Math.floor(timeLeft / 60);
  const pomodoroSecs = timeLeft % 60;
  const pomodoroTotalSecs = Math.max(1, getModeDurationMinutes(mode) * 60);
  const pomodoroProgress = Math.min(100, Math.max(0, ((pomodoroTotalSecs - timeLeft) / pomodoroTotalSecs) * 100));

  // Stopwatch
  const swHours = Math.floor(stopwatchSeconds / 3600);
  const swMinutes = Math.floor((stopwatchSeconds % 3600) / 60);
  const swSecs = stopwatchSeconds % 60;

  // Custom Countdown
  const cdMinutes = Math.floor(customCountdownLeft / 60);
  const cdSecs = customCountdownLeft % 60;
  const cdTotalSecs = Math.max(1, customCountdownMinutes * 60);
  const cdProgress = Math.min(100, Math.max(0, ((cdTotalSecs - customCountdownLeft) / cdTotalSecs) * 100));

  const modeTheme = {
    focus: {
      label: 'Tập Trung Cao Độ',
      color: 'text-rose-600',
      bgLight: 'bg-rose-50',
      ringColor: '#f43f5e',
      badgeBg: 'bg-rose-100 text-rose-800',
    },
    shortBreak: {
      label: 'Giải Lao Ngắn',
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      ringColor: '#10b981',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    longBreak: {
      label: 'Nghỉ Ngơi Dài',
      color: 'text-sky-600',
      bgLight: 'bg-sky-50',
      ringColor: '#0284c7',
      badgeBg: 'bg-sky-100 text-sky-800',
    },
  }[mode];

  return (
    <div
      id="pomodoro-focus-widget"
      className={`bg-white rounded-3xl border border-stone-200 shadow-xs transition-all relative overflow-hidden ${
        isStandaloneSection ? 'p-6 md:p-8' : 'p-5'
      }`}
    >
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 rounded-2xl bg-purple-900 text-white text-xs font-semibold shadow-md flex items-center justify-between border border-purple-700"
          >
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>{feedbackToast}</span>
            </div>
            <button type="button" onClick={() => setFeedbackToast('')} className="text-stone-300 hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md text-white flex flex-col justify-between p-6 sm:p-10"
          >
            <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <span>Không Gian Bấm Giờ Tập Trung (Zen Mode)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsZenMode(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Thu nhỏ</span>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center text-center my-auto">
              {activeTask && (
                <div className="mb-6 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-stone-300 text-xs font-medium">
                  Đang ôn: <strong className="text-white">{activeTask.subject}</strong> — {activeTask.title}
                </div>
              )}

              {/* Big Time in Zen Mode */}
              <div className="text-7xl sm:text-8xl md:text-9xl font-extrabold font-mono tracking-tighter tabular-nums select-none">
                {operationalType === 'pomodoro' && (
                  `${String(pomodoroMinutes).padStart(2, '0')}:${String(pomodoroSecs).padStart(2, '0')}`
                )}
                {operationalType === 'stopwatch' && (
                  `${swHours > 0 ? String(swHours).padStart(2, '0') + ':' : ''}${String(swMinutes).padStart(2, '0')}:${String(swSecs).padStart(2, '0')}`
                )}
                {operationalType === 'countdown' && (
                  `${String(cdMinutes).padStart(2, '0')}:${String(cdSecs).padStart(2, '0')}`
                )}
              </div>

              <div className="text-sm font-medium text-stone-400 mt-4 tracking-wide uppercase">
                {operationalType === 'pomodoro' && modeTheme.label}
                {operationalType === 'stopwatch' && 'Đồng Hồ Bấm Giờ Xuôi — Đo Thời Gian Thực'}
                {operationalType === 'countdown' && `Đếm Ngược ${customCountdownMinutes} Phút`}
              </div>

              {/* Zen Mode Buttons */}
              <div className="flex items-center gap-4 mt-8">
                {operationalType === 'pomodoro' && (
                  <>
                    <button
                      type="button"
                      onClick={toggleRunPomodoro}
                      className={`w-44 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        isRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white text-stone-950 hover:bg-stone-100'
                      }`}
                    >
                      {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                      <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu ôn'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPomodoro}
                      className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </>
                )}

                {operationalType === 'stopwatch' && (
                  <>
                    <button
                      type="button"
                      onClick={toggleRunStopwatch}
                      className={`w-44 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        isStopwatchRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {isStopwatchRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                      <span>{isStopwatchRunning ? 'Tạm dừng' : 'Bắt đầu bấm giờ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStopwatchToTask}
                      className="px-4 h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lưu vào bài</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetStopwatch}
                      className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </>
                )}

                {operationalType === 'countdown' && (
                  <>
                    <button
                      type="button"
                      onClick={toggleRunCountdown}
                      className={`w-44 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        isCustomCountdownRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white text-stone-950 hover:bg-stone-100'
                      }`}
                    >
                      {isCustomCountdownRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                      <span>{isCustomCountdownRunning ? 'Tạm dừng' : 'Bắt đầu đếm ngược'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCountdown}
                      className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="text-center text-stone-500 text-xs max-w-md mx-auto">
              Mỗi phút kiên định hôm nay mở ra cánh cổng đại học mơ ước ngày mai.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Header with Operational Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center text-base font-bold shadow-2xs shrink-0">
            {operationalType === 'pomodoro' ? '🍅' : operationalType === 'stopwatch' ? '⏱️' : '⏳'}
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-stone-900">
              Trạm Bấm Giờ Học Sâu 2K9
            </h3>
            <p className="text-xs text-stone-500">
              Lựa chọn phương thức bấm giờ tối ưu cho từng buổi học
            </p>
          </div>
        </div>

        {/* 3 Operational Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl self-start sm:self-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setOperationalType('pomodoro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              operationalType === 'pomodoro'
                ? 'bg-white text-rose-700 shadow-2xs border border-stone-200/60 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            <span>🍅</span>
            <span>Pomodoro (25/50/90p)</span>
          </button>

          <button
            type="button"
            onClick={() => setOperationalType('stopwatch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              operationalType === 'stopwatch'
                ? 'bg-white text-emerald-700 shadow-2xs border border-stone-200/60 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
            title="Đo xem bạn thực tế dành bao nhiêu thời gian cho bài học"
          >
            <span>⏱️</span>
            <span>Bấm Giờ Xuôi (Stopwatch)</span>
          </button>

          <button
            type="button"
            onClick={() => setOperationalType('countdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              operationalType === 'countdown'
                ? 'bg-white text-purple-700 shadow-2xs border border-stone-200/60 font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            <span>⏳</span>
            <span>Đếm Ngược Tùy Chỉnh</span>
          </button>
        </div>

        {/* Utility icons: Sound, Settings, Zen mode */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded-xl transition-colors ${
              settings.soundEnabled
                ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            }`}
            title={settings.soundEnabled ? 'Tắt chuông báo' : 'Bật chuông báo'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl transition-colors ${
              showSettingsDrawer
                ? 'text-purple-700 bg-purple-100'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
            title="Cài đặt thời gian"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsZenMode(true)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Chế độ Zen toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synced Day Multi-Task Queue Header & Stepper */}
      <div className="mb-5 p-4 rounded-3xl bg-gradient-to-r from-purple-50/90 via-rose-50/60 to-amber-50/70 border border-purple-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              📅
            </div>
            <div>
              <div className="text-xs md:text-sm font-bold text-purple-950 flex items-center gap-2 flex-wrap">
                <span>Chuỗi Học Đồng Bộ: {DAYS_OF_WEEK.find((d) => d.day === syncedDay)?.label || 'Hôm nay'}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {dayTasksCompleted.length}/{dayTasks.length} bài xong
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Auto-Sync Tự Chuyển Bài
                </span>
              </div>
              <p className="text-[11px] text-purple-800/80 mt-0.5">
                Ấn vào ngày để kết nối toàn bộ ca học: Xong bài nào sẽ tự đánh dấu hoàn thành & tự động nhảy sang bài tiếp theo.
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium self-end sm:self-auto flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chế độ Auto-Advance Bật</span>
          </div>
        </div>

        {/* Quick Day Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white/80 rounded-2xl border border-purple-200/60 mb-3.5 no-scrollbar">
          {DAYS_OF_WEEK.map((d) => {
            const isSelected = syncedDay === d.day;
            const isToday = currentDayOfWeek === d.day;
            const countForDay = tasks.filter((t) => t.dayOfWeek === d.day).length;
            const completedCountForDay = tasks.filter((t) => t.dayOfWeek === d.day && t.completed).length;

            return (
              <button
                key={d.day}
                type="button"
                onClick={() => {
                  const newDay = d.day;
                  setSyncedDay(newDay);
                  try {
                    localStorage.setItem('si_tu_2027_synced_day_v1', String(newDay));
                  } catch {}
                  const newDayTasks = tasks.filter((t) => t.dayOfWeek === newDay);
                  const firstUnfinished = newDayTasks.find((t) => !t.completed) || newDayTasks[0];
                  if (firstUnfinished) {
                    setManualTaskId(firstUnfinished.id);
                    try {
                      localStorage.setItem(STORAGE_ACTIVE_TASK_KEY, firstUnfinished.id);
                    } catch {}
                  }
                  playChimeSound('start');
                  setFeedbackToast(
                    `🍅 Đã đồng bộ toàn bộ ${newDayTasks.length} ca học của ${d.label}! Xong bài 1 tự done & tự chuyển qua bài 2.`
                  );
                  setTimeout(() => setFeedbackToast(''), 4500);
                }}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold shadow-2xs border-purple-600'
                    : isToday
                    ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                    : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200/60 hover:bg-stone-50'
                }`}
                title={`Nhấn để kết nối và tự động chuyển bài cho toàn bộ ca học của ${d.label}`}
              >
                <span>{d.label}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Hôm nay" />
                )}
                {countForDay > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isSelected
                        ? 'bg-purple-500 text-white font-bold'
                        : completedCountForDay === countForDay
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {completedCountForDay}/{countForDay}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Queue Cards */}
        {dayTasks.length > 0 ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {dayTasks.map((t, idx) => {
                const isActive = t.id === activeTaskId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setManualTaskId(t.id);
                      try {
                        localStorage.setItem(STORAGE_ACTIVE_TASK_KEY, t.id);
                      } catch {}
                    }}
                    className={`p-2.5 rounded-2xl text-left transition-all border flex items-start gap-2 ${
                      isActive
                        ? 'bg-white text-purple-950 border-purple-500 shadow-xs ring-2 ring-purple-400/40'
                        : t.completed
                        ? 'bg-emerald-50/70 text-stone-500 border-emerald-200 opacity-80'
                        : 'bg-white/70 text-stone-700 border-stone-200/80 hover:bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : isActive ? (
                        <span className="relative flex h-3.5 w-3.5 mt-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-600"></span>
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-[10px] font-bold text-stone-400">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {t.subject}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{t.durationMinutes}p</span>
                      </div>
                      <div
                        className={`text-xs font-bold truncate mt-1 ${
                          isActive
                            ? 'text-purple-950 font-extrabold'
                            : t.completed
                            ? 'line-through text-stone-400'
                            : 'text-stone-800'
                        }`}
                      >
                        {t.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active task quick controls */}
            {activeTask && (
              <div className="mt-2.5 pt-2.5 border-t border-purple-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-xs text-purple-900 font-medium truncate">
                  <strong>
                    Đang tập trung bài {dayTasks.findIndex((t) => t.id === activeTaskId) + 1}/{dayTasks.length}:
                  </strong>{' '}
                  <span className="font-bold">{activeTask.title}</span> ({activeTask.subject} • {activeTask.durationMinutes}p)
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCompleteAndAdvanceToNextTask(activeTask.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-2xs transition-all hover:scale-102 active:scale-98"
                    title="Đánh dấu hoàn thành bài này và tự động nhảy sang bài tiếp theo"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Xong bài này & Sang bài tiếp →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/70 border border-stone-200 text-center text-xs text-stone-500">
            Ngày này chưa có bài học nào trong Lịch học. Hãy chuyển sang tab <strong>Lịch Học 2K9</strong> để thêm bài học.
          </div>
        )}
      </div>

      {/* ========================================================
          PANEL 1: POMODORO MODE (25/50/90p)
         ======================================================== */}
      {operationalType === 'pomodoro' && (
        <div className="space-y-5">
          {/* Mode Selector (Focus / Short Break / Long Break) */}
          <div className="flex items-center justify-center gap-1.5 p-1 bg-stone-100 rounded-2xl max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => handleSelectMode('focus')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'focus'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-rose-500" />
              <span>Học tập ({settings.focusMinutes}p)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('shortBreak')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'shortBreak'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-emerald-500" />
              <span>Nghỉ ngắn ({settings.shortBreakMinutes}p)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('longBreak')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'longBreak'
                  ? 'bg-white text-sky-700 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Nghỉ dài ({settings.longBreakMinutes}p)</span>
            </button>
          </div>

          {/* Active Task in Focus */}
          {activeTask ? (
            <div className="p-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-50 via-rose-50/70 to-amber-50/70 border border-purple-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  🎯
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] flex-wrap">
                    <span className="font-extrabold text-purple-900">
                      Ca {dayTasks.findIndex((t) => t.id === activeTaskId) + 1}/{dayTasks.length} ({DAYS_OF_WEEK.find((d) => d.day === syncedDay)?.label || 'Hôm nay'}):
                    </span>
                    <span className="font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                      {activeTask.subject}
                    </span>
                    <span className="text-stone-500 font-medium">({activeTask.durationMinutes}p)</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-stone-900 truncate mt-0.5">
                    {activeTask.title}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCompleteAndAdvanceToNextTask(activeTask.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all hover:scale-102 active:scale-98 shrink-0 self-end sm:self-auto"
                title="Đánh dấu hoàn thành ca học này và tự động chuyển sang ca tiếp theo"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xong bài này ➔ Qua bài tiếp</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-center text-xs text-stone-500">
              Chưa có bài học nào được lên lịch cho {DAYS_OF_WEEK.find((d) => d.day === syncedDay)?.label}. Bạn có thể chọn ngày khác ở trên hoặc chuyển sang tab Lịch Học 2K9.
            </div>
          )}

          {/* Big Time Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-stone-900 tabular-nums select-none">
              {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSecs).padStart(2, '0')}
            </div>

            {/* Circular/Linear progress line */}
            <div className="w-48 sm:w-64 h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                style={{ width: `${pomodoroProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-400 font-medium mt-1.5">
              Đã học {Math.floor((pomodoroTotalSecs - timeLeft) / 60)} / {getModeDurationMinutes(mode)} phút
            </div>
          </div>

          {/* Pomodoro Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleRunPomodoro}
              className={`px-8 py-3 rounded-2xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-105 active:scale-98'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isRunning ? 'Tạm dừng hiệp' : 'Bắt đầu học'}</span>
            </button>

            {activeTask && (
              <button
                type="button"
                onClick={() => handleCompleteAndAdvanceToNextTask(activeTask.id)}
                className="px-4 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:scale-102 active:scale-98"
                title="Đánh dấu hoàn thành bài học này và tự động chuyển sang bài tiếp theo"
              >
                <Check className="w-4 h-4 text-purple-700" />
                <span>Xong ca & Qua bài tiếp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetPomodoro}
              className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              title="Đặt lại hiệp này"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Presets Quick Picker */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="text-[11px] text-stone-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Gói chuẩn:
            </span>
            {POMODORO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border ${
                  settings.focusMinutes === preset.focusMinutes
                    ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200/60'
                }`}
              >
                {preset.name} ({preset.focusMinutes}p)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          PANEL 2: STOPWATCH MODE (BẤM GIỜ XUÔI - ĐO THỜI GIAN THỰC)
         ======================================================== */}
      {operationalType === 'stopwatch' && (
        <div className="space-y-5">
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <span>
                <strong>Đồng hồ bấm giờ xuôi:</strong> Bắt đầu tính giờ từ 00:00 để đo chính xác bạn dành bao nhiêu thời gian cho bài học này.
              </span>
            </div>
            {isStopwatchRunning && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 animate-pulse">
                ● Đang tính giờ
              </span>
            )}
          </div>

          {/* Stopwatch Big Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-emerald-950 tabular-nums select-none">
              {swHours > 0 && `${String(swHours).padStart(2, '0')}:`}
              {String(swMinutes).padStart(2, '0')}:{String(swSecs).padStart(2, '0')}
            </div>

            <div className="text-xs font-semibold text-emerald-700 mt-2">
              Đã ghi nhận: {swHours > 0 ? `${swHours} giờ ` : ''}{swMinutes} phút {swSecs} giây
            </div>
          </div>

          {/* Stopwatch Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleRunStopwatch}
              className={`px-8 py-3 rounded-2xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                isStopwatchRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-98'
              }`}
            >
              {isStopwatchRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isStopwatchRunning ? 'Tạm dừng' : 'Bắt đầu đo thời gian'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveStopwatchToTask}
              disabled={stopwatchSeconds < 10}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              title="Lưu số phút vừa học vào ca học này"
            >
              <Check className="w-4 h-4" />
              <span>Hoàn thành & Lưu vào bài ({Math.max(1, Math.round(stopwatchSeconds / 60))}p)</span>
            </button>

            <button
              type="button"
              onClick={handleResetStopwatch}
              className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              title="Đặt lại về 00:00"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PANEL 3: CUSTOM COUNTDOWN MODE (ĐẾM NGƯỢC TÙY CHỈNH)
         ======================================================== */}
      {operationalType === 'countdown' && (
        <div className="space-y-5">
          {/* Quick Minutes Selectors */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[15, 30, 45, 60, 75, 90, 120, 150].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleSelectCustomMinutes(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  customCountdownMinutes === m
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-bold'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200/60'
                }`}
              >
                {m} phút
              </button>
            ))}
          </div>

          {/* Big Countdown Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter text-purple-950 tabular-nums select-none">
              {String(cdMinutes).padStart(2, '0')}:{String(cdSecs).padStart(2, '0')}
            </div>

            <div className="w-48 sm:w-64 h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${cdProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-400 font-medium mt-1.5">
              Đếm ngược từ {customCountdownMinutes} phút
            </div>
          </div>

          {/* Countdown Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleRunCountdown}
              className={`px-8 py-3 rounded-2xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                isCustomCountdownRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 active:scale-98'
              }`}
            >
              {isCustomCountdownRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isCustomCountdownRunning ? 'Tạm dừng' : `Bắt đầu (${customCountdownMinutes}p)`}</span>
            </button>

            <button
              type="button"
              onClick={handleResetCountdown}
              className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              title="Đặt lại"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Drawer (Duration sliders, ambient sounds, auto-advance) */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-5 border-t border-stone-200"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cài Đặt Chuyên Sâu Pomodoro & Âm Thanh Nền</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Thu gọn ▲
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Hiệp học Pomodoro (phút)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={settings.focusMinutes}
                    onChange={(e) =>
                      handleUpdateSettings({ focusMinutes: Math.max(1, Math.min(180, Number(e.target.value) || 25)) })
                    }
                    className="w-full text-sm font-bold font-mono px-2 py-1 bg-white border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nghỉ ngắn (phút)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settings.shortBreakMinutes}
                    onChange={(e) =>
                      handleUpdateSettings({ shortBreakMinutes: Math.max(1, Math.min(60, Number(e.target.value) || 5)) })
                    }
                    className="w-full text-sm font-bold font-mono px-2 py-1 bg-white border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nghỉ dài (phút)
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={settings.longBreakMinutes}
                    onChange={(e) =>
                      handleUpdateSettings({ longBreakMinutes: Math.max(5, Math.min(90, Number(e.target.value) || 15)) })
                    }
                    className="w-full text-sm font-bold font-mono px-2 py-1 bg-white border border-stone-200 rounded-lg text-stone-800"
                  />
                </div>
              </div>

              {/* Ambient Sound Selector */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="block text-xs font-semibold text-stone-800 mb-2 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-600" />
                  <span>Âm thanh nền tập trung (White noise / Tiếng mưa rào)</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Yên tĩnh tuyệt đối' },
                    { id: 'rain', label: 'Tiếng mưa rào dịu êm' },
                    { id: 'clock', label: 'Tích tắc đồng hồ' },
                  ].map((amb) => (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => handleUpdateSettings({ ambientSound: amb.id as PomodoroSettings['ambientSound'] })}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors ${
                        settings.ambientSound === amb.id
                          ? 'bg-purple-600 text-white border-purple-600 font-bold'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {amb.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
