'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain, Sparkles } from 'lucide-react';
import { playChimeSound } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface PomodoroWidgetProps {
  onSessionCompleted?: (minutes: number) => void;
  onRunningChange?: (running: boolean) => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_CONFIG: { [key in TimerMode]: { label: string; defaultMinutes: number; color: string; ringColor: string } } = {
  focus: { label: 'Tập Trung Cao Độ', defaultMinutes: 25, color: 'text-rose-600', ringColor: '#f43f5e' },
  shortBreak: { label: 'Giải Lao Ngắn', defaultMinutes: 5, color: 'text-emerald-600', ringColor: '#10b981' },
  longBreak: { label: 'Nghỉ Ngơi Dài', defaultMinutes: 15, color: 'text-sky-600', ringColor: '#0284c7' },
};

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ onSessionCompleted, onRunningChange }) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentConfig = MODE_CONFIG[mode];
  const totalSeconds = currentConfig.defaultMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  const handleSelectMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].defaultMinutes * 60);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Completed!
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);

            if (soundEnabled) {
              playChimeSound('complete');
            }

            if (mode === 'focus') {
              setCompletedSessions((c) => c + 1);
              if (onSessionCompleted) {
                onSessionCompleted(currentConfig.defaultMinutes);
              }
              try {
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.6 },
                });
              } catch {
                // ignore
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled, currentConfig.defaultMinutes, onSessionCompleted]);

  const toggleRun = () => {
    if (!isRunning && soundEnabled) {
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
    setTimeLeft(currentConfig.defaultMinutes * 60);
    if (onRunningChange) {
      onRunningChange(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      id="pomodoro-focus-widget"
      className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">
            🍅
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Đồng Hồ Tập Trung (Pomodoro)</h3>
            <p className="text-[11px] text-stone-500">Giữ nhịp học sâu 25 phút không xao nhãng</p>
          </div>
        </div>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title={soundEnabled ? 'Tắt âm báo kết thúc' : 'Bật âm báo kết thúc'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-1 p-1 bg-stone-100 rounded-2xl mb-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => handleSelectMode('focus')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
            mode === 'focus'
              ? 'bg-white text-rose-700 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Học sâu (25p)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('shortBreak')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
            mode === 'shortBreak'
              ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Nghỉ ngắn (5p)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('longBreak')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
            mode === 'longBreak'
              ? 'bg-white text-sky-700 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Nghỉ dài (15p)</span>
        </button>
      </div>

      {/* Circular Timer Display */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-stone-100"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={currentConfig.ringColor}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Time Digits in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-stone-900 font-mono tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] font-medium text-stone-500 mt-0.5">
              {currentConfig.label}
            </span>
          </div>
        </div>

        {/* Sessions badge */}
        <div className="mt-2 text-xs text-stone-500 flex items-center gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Đã hoàn thành: <strong className="text-stone-800">{completedSessions} hiệp</strong></span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={handleReset}
          className="p-2.5 rounded-2xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all active:scale-95"
          title="Đặt lại hiệp này"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-pomodoro"
          type="button"
          onClick={toggleRun}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-stone-900 hover:bg-black'
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
      </div>
    </div>
  );
};
