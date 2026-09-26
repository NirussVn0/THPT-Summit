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
import { DEFAULT_POMODORO_SETTINGS, POMODORO_PRESETS, playChimeSound } from '@/lib/constants';
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

  // Synced Task state
  const currentDayOfWeek = new Date().getDay();
  const todayTasks = tasks.filter((t) => t.dayOfWeek === currentDayOfWeek);

  const [manualTaskId, setManualTaskId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_ACTIVE_TASK_KEY) || '';
      } catch {}
    }
    return '';
  });

  const selectedTaskId = manualTaskId && tasks.some((t) => t.id === manualTaskId)
    ? manualTaskId
    : todayTasks.find((t) => !t.completed)?.id || todayTasks[0]?.id || tasks[0]?.id || '';

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Toast feedback message inside widget
  const [feedbackToast, setFeedbackToast] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const ambientAudioRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<{ stop: () => void } | null>(null);

  // Listen for task sync events dispatched on double-click
  useEffect(() => {
    const handleSyncEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ taskId: string }>;
      if (customEvt.detail?.taskId) {
        setManualTaskId(customEvt.detail.taskId);
        const taskObj = tasks.find((t) => t.id === customEvt.detail.taskId);
        if (taskObj) {
          setFeedbackToast(`🍅 Đã kết nối với bài học: "${taskObj.title}"`);
          setTimeout(() => setFeedbackToast(''), 4000);
        }
      }
    };

    window.addEventListener('si_tu_2027_sync_timer_task', handleSyncEvent);
    return () => window.removeEventListener('si_tu_2027_sync_timer_task', handleSyncEvent);
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

              // Auto-sync with study schedule task
              if (settings.syncWithSchedule && selectedTaskId && onUpdateTasks) {
                const currentTask = tasks.find((t) => t.id === selectedTaskId);
                if (currentTask) {
                  const updatedLoggedMinutes = (currentTask.loggedFocusMinutes || 0) + minutesSpent;
                  const isNowCompleted = updatedLoggedMinutes >= currentTask.durationMinutes || currentTask.completed;

                  onUpdateTasks(
                    tasks.map((t) =>
                      t.id === selectedTaskId
                        ? { ...t, loggedFocusMinutes: updatedLoggedMinutes, completed: isNowCompleted }
                        : t
                    )
                  );
                }
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
  };

  const handleResetPomodoro = () => {
    setIsRunning(false);
    setTimeLeft(getModeDurationMinutes(mode) * 60);
    if (onRunningChange) onRunningChange(false);
    stopAmbientSound();
    playChimeSound('click');
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
    if (!selectedTaskId || !onUpdateTasks) return;
    const updated = tasks.map((t) => (t.id === selectedTaskId ? { ...t, completed: true } : t));
    onUpdateTasks(updated);
    playChimeSound('complete');
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch {}
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

      {/* Synced Task Indicator Pill */}
      {activeTask && (
        <div className="mb-4 p-3 rounded-2xl bg-purple-50/70 border border-purple-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">🎯</span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5 truncate">
                <span>Đang kết nối:</span>
                <span className="text-purple-800 font-extrabold truncate">{activeTask.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                  {activeTask.subject} • {activeTask.durationMinutes}p
                </span>
              </div>
              {activeTask.subtasks && activeTask.subtasks.length > 0 && (
                <div className="text-[11px] text-purple-700 mt-0.5">
                  Việc nhỏ: {activeTask.subtasks.filter((s) => s.completed).length}/{activeTask.subtasks.length} đã xong
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* Task selector dropdown */}
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setManualTaskId(e.target.value);
                try {
                  localStorage.setItem(STORAGE_ACTIVE_TASK_KEY, e.target.value);
                } catch {}
              }}
              className="text-xs bg-white border border-purple-200 text-purple-900 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.completed ? '✓ ' : ''}{t.subject}: {t.title.slice(0, 28)}...
                </option>
              ))}
            </select>

            {!activeTask.completed && (
              <button
                type="button"
                onClick={handleQuickMarkTaskComplete}
                className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1"
                title="Đánh dấu ca học này đã hoàn thành"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xong ca</span>
              </button>
            )}
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-center gap-3">
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
