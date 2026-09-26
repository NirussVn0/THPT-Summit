'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
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

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const STORAGE_POMODORO_SETTINGS_KEY = 'si_tu_2027_pomodoro_settings_v1';

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  tasks = [],
  onUpdateTasks,
  onSessionCompleted,
  onRunningChange,
  isStandaloneSection = false,
}) => {
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

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(() => settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Synced Task state
  const currentDayOfWeek = new Date().getDay();
  const todayTasks = tasks.filter((t) => t.dayOfWeek === currentDayOfWeek);
  const [manualTaskId, setManualTaskId] = useState<string>('');
  const selectedTaskId = manualTaskId && tasks.some((t) => t.id === manualTaskId)
    ? manualTaskId
    : todayTasks.find((t) => !t.completed)?.id || todayTasks[0]?.id || '';

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ambientAudioRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<{ stop: () => void } | null>(null);

  // Current active synced task
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Calculate current duration for the active mode
  const getModeDurationMinutes = React.useCallback(
    (targetMode: TimerMode): number => {
      if (targetMode === 'focus') return settings.focusMinutes;
      if (targetMode === 'shortBreak') return settings.shortBreakMinutes;
      return settings.longBreakMinutes;
    },
    [settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]
  );

  const totalSeconds = Math.max(1, getModeDurationMinutes(mode) * 60);
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

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

  // Save settings helper
  const handleUpdateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_POMODORO_SETTINGS_KEY, JSON.stringify(updated));
    } catch {}

    // If timer is not running, adjust timeLeft according to the new setting
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

  // Switch timer mode
  const handleSelectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getModeDurationMinutes(newMode) * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (onRunningChange) onRunningChange(false);
    stopAmbientSound();
  };

  // Quick preset apply
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

  // Web Audio Ambient generator using deterministic pseudo-random noise generator
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
          // Pink/brown filter for gentle rain/ambient noise
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
        // Subtle rhythmic tick
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

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      if (settings.ambientSound !== 'none') {
        startAmbientSound(settings.ambientSound);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Completed cycle
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            stopAmbientSound();

            if (settings.soundEnabled) {
              playChimeSound('complete');
            }

            if (mode === 'focus') {
              const newSessionCount = completedSessions + 1;
              setCompletedSessions(newSessionCount);
              const minutesSpent = settings.focusMinutes;

              if (onSessionCompleted) {
                onSessionCompleted(minutesSpent);
              }

              // Auto-sync with study schedule task
              if (settings.syncWithSchedule && selectedTaskId && onUpdateTasks) {
                const currentTask = tasks.find((t) => t.id === selectedTaskId);
                if (currentTask) {
                  const updatedLoggedMinutes = (currentTask.loggedFocusMinutes || 0) + minutesSpent;
                  const isNowCompleted = updatedLoggedMinutes >= currentTask.durationMinutes || currentTask.completed;

                  const updatedTasks = tasks.map((t) => {
                    if (t.id === selectedTaskId) {
                      return {
                        ...t,
                        loggedFocusMinutes: updatedLoggedMinutes,
                        completed: isNowCompleted,
                      };
                    }
                    return t;
                  });

                  onUpdateTasks(updatedTasks);
                }
              }

              try {
                confetti({
                  particleCount: 60,
                  spread: 60,
                  origin: { y: 0.6 },
                });
              } catch {}

              // Auto-transition to break
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
              // Break finished -> back to focus
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
      stopAmbientSound();
    };
  }, [
    isRunning,
    mode,
    settings,
    completedSessions,
    selectedTaskId,
    tasks,
    onSessionCompleted,
    onRunningChange,
    onUpdateTasks,
    getModeDurationMinutes,
    startAmbientSound,
    stopAmbientSound,
  ]);

  const toggleRun = () => {
    if (!isRunning && settings.soundEnabled) {
      playChimeSound('start');
    }
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (onRunningChange) {
      onRunningChange(nextRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getModeDurationMinutes(mode) * 60);
    if (onRunningChange) {
      onRunningChange(false);
    }
    stopAmbientSound();
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

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
                <span>🍅 Không Gian Tập Trung Tuyệt Đối (Zen Mode)</span>
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
              <div className="text-8xl md:text-9xl font-extrabold font-mono tracking-tighter tabular-nums select-none">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-sm font-medium text-stone-400 mt-4 tracking-wide uppercase">
                {modeTheme.label}
              </div>

              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={toggleRun}
                  className={`w-44 h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu ôn'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center text-stone-500 text-xs max-w-md mx-auto">
              Mỗi phút kiên định hôm nay mở ra cánh cổng đại học mơ ước ngày mai.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center text-lg font-bold shadow-2xs shrink-0">
            🍅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-stone-900">
                Trạm Tập Trung Pomodoro 2K9
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modeTheme.badgeBg}`}>
                {mode === 'focus' ? 'Chu kỳ học' : 'Nghỉ ngơi'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Giữ nhịp học sâu, chống mệt mỏi và duy trì phản xạ phòng thi
            </p>
          </div>
        </div>

        {/* Action icons: Sound, Settings, Zen mode */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className="w-8 h-8 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors flex items-center justify-center"
            title={settings.soundEnabled ? 'Tắt âm báo kết thúc' : 'Bật âm báo kết thúc'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsZenMode(true)}
            className="w-8 h-8 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors flex items-center justify-center"
            title="Chế độ tập trung toàn màn hình (Zen Mode)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`w-8 h-8 rounded-xl transition-colors flex items-center justify-center ${
              showSettingsDrawer ? 'bg-purple-100 text-purple-700 font-bold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
            title="Cài đặt Pomodoro & Tùy chỉnh thời gian"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs - Fixed flex distribution with border-transparent to prevent ANY displacement */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-stone-100 rounded-2xl mb-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => handleSelectMode('focus')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all border ${
            mode === 'focus'
              ? 'bg-white text-rose-700 shadow-2xs font-semibold border-stone-200/50'
              : 'text-stone-600 hover:text-stone-900 border-transparent'
          }`}
        >
          <Brain className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Học sâu ({settings.focusMinutes}p)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('shortBreak')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all border ${
            mode === 'shortBreak'
              ? 'bg-white text-emerald-700 shadow-2xs font-semibold border-stone-200/50'
              : 'text-stone-600 hover:text-stone-900 border-transparent'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Nghỉ ngắn ({settings.shortBreakMinutes}p)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('longBreak')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all border ${
            mode === 'longBreak'
              ? 'bg-white text-sky-700 shadow-2xs font-semibold border-stone-200/50'
              : 'text-stone-600 hover:text-stone-900 border-transparent'
          }`}
        >
          <span className="truncate">Nghỉ dài ({settings.longBreakMinutes}p)</span>
        </button>
      </div>

      {/* Auto-Sync with Study Schedule Banner / Selector */}
      {settings.syncWithSchedule && (
        <div className="mb-4 p-3 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-950">
              <CalendarCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Đồng bộ nhiệm vụ lịch học hôm nay:</span>
            </div>
            {activeTask && (
              <span className="text-[11px] text-purple-700 font-semibold shrink-0">
                {activeTask.loggedFocusMinutes || 0}/{activeTask.durationMinutes}p đã ôn
              </span>
            )}
          </div>

          {todayTasks.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <select
                value={selectedTaskId}
                onChange={(e) => setManualTaskId(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-purple-400 min-w-0"
              >
                {todayTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.subject}] {t.title} ({t.timeSlot}) {t.completed ? '✓ Đã xong' : ''}
                  </option>
                ))}
              </select>

              {activeTask && !activeTask.completed && (
                <button
                  type="button"
                  onClick={handleQuickMarkTaskComplete}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-purple-800 hover:text-purple-950 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1"
                  title="Đánh dấu hoàn thành nhiệm vụ này trong Lịch học"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Xong môn này</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-purple-800 flex items-center justify-between">
              <span>Hôm nay chưa có buổi học nào trong lịch.</span>
              <span className="font-semibold text-purple-900">Các phút tập trung vẫn được lưu vào kỷ luật!</span>
            </div>
          )}
        </div>
      )}

      {/* Main Timer Display Section */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Progress Circle with smooth stroke */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-stone-100"
              strokeWidth="5.5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={modeTheme.ringColor}
              strokeWidth="5.5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          {/* Time digits - Tabular nums ensures 0 width twitching */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-4xl font-extrabold text-stone-900 font-mono tracking-tight tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-stone-500 mt-1">
              {modeTheme.label}
            </span>
          </div>
        </div>

        {/* Sessions badge & quick info */}
        <div className="mt-3 text-xs text-stone-600 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            Đã hoàn thành: <strong className="text-stone-900">{completedSessions} hiệp</strong>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-500">
            Hiệp dài sau mỗi {settings.longBreakInterval} hiệp
          </span>
        </div>
      </div>

      {/* Control Buttons - Fixed widths prevent layout shift */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={handleReset}
          className="w-11 h-11 rounded-2xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all flex items-center justify-center shrink-0 border border-stone-200/80 shadow-2xs"
          title="Đặt lại hiệp này"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Start / Pause Button with fixed width to eliminate any button jump */}
        <button
          id="btn-toggle-pomodoro"
          type="button"
          onClick={toggleRun}
          className={`w-44 h-11 rounded-2xl text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200/50'
              : 'bg-stone-900 hover:bg-black shadow-stone-300/40'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Tạm dừng</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Bắt đầu ôn</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          className={`w-11 h-11 rounded-2xl transition-all flex items-center justify-center shrink-0 border shadow-2xs ${
            showSettingsDrawer
              ? 'bg-purple-600 text-white border-purple-600'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 border-stone-200/80'
          }`}
          title="Tùy chỉnh thời gian & Cài đặt"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Collapsible Pomodoro Settings Panel */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-stone-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cài Đặt Thời Gian & Tự Động Hóa</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-medium"
                >
                  Đóng
                </button>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1.5">
                  Lựa chọn nhanh chế độ học:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {POMODORO_PRESETS.map((preset) => {
                    const isPresetActive =
                      settings.focusMinutes === preset.focusMinutes &&
                      settings.shortBreakMinutes === preset.shortBreakMinutes;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs ${
                          isPresetActive
                            ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold shadow-2xs'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200/80 text-stone-700'
                        }`}
                      >
                        <div className="font-bold text-[11px] truncate">{preset.name}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {preset.focusMinutes}p / {preset.shortBreakMinutes}p
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Precise Duration Controls */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Focus duration */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Tập trung (phút)
                  </span>
                  <div className="flex items-center gap-1">
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
                </div>

                {/* Short break duration */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nghỉ ngắn (phút)
                  </span>
                  <div className="flex items-center gap-1">
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
                </div>

                {/* Long break duration */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nghỉ dài (phút)
                  </span>
                  <div className="flex items-center gap-1">
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
              </div>

              {/* Automation Toggles */}
              <div className="space-y-2 pt-1 text-xs">
                {/* Sync with schedule toggle */}
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors border border-stone-200/60">
                  <div>
                    <div className="font-semibold text-stone-800">Tự động đồng bộ với Lịch Học 2K9</div>
                    <div className="text-[11px] text-stone-500">
                      Tự động tính phút học và hoàn thành nhiệm vụ theo thời khóa biểu
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.syncWithSchedule}
                    onChange={(e) => handleUpdateSettings({ syncWithSchedule: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                {/* Auto start breaks */}
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors border border-stone-200/60">
                  <div>
                    <div className="font-semibold text-stone-800">Tự động bắt đầu giờ nghỉ</div>
                    <div className="text-[11px] text-stone-500">Tự chuyển sang đếm ngược giải lao khi hết giờ học</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => handleUpdateSettings({ autoStartBreaks: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                {/* Auto start next focus */}
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors border border-stone-200/60">
                  <div>
                    <div className="font-semibold text-stone-800">Tự động vào hiệp học mới</div>
                    <div className="text-[11px] text-stone-500">Hết giờ nghỉ sẽ tự động đếm ngược hiệp học tiếp theo</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoStartFocus}
                    onChange={(e) => handleUpdateSettings({ autoStartFocus: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                {/* Ambient sound selector */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-purple-600" />
                      <span>Âm thanh nền tập trung (White noise / Tiếng mưa)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'none', label: 'Yên tĩnh' },
                      { id: 'rain', label: 'Mưa rào dịu êm' },
                      { id: 'clock', label: 'Tích tắc đồng hồ' },
                    ].map((amb) => (
                      <button
                        key={amb.id}
                        type="button"
                        onClick={() => handleUpdateSettings({ ambientSound: amb.id as PomodoroSettings['ambientSound'] })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                          settings.ambientSound === amb.id
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {amb.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
