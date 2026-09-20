'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { PinnedDreamHero } from '@/components/PinnedDreamHero';
import { CountdownGrid } from '@/components/CountdownGrid';
import { SmartStudyPlanner } from '@/components/SmartStudyPlanner';
import { PomodoroWidget } from '@/components/PomodoroWidget';
import { ReminderNotificationCenter } from '@/components/ReminderNotificationCenter';
import { DailyTipsWidget } from '@/components/DailyTipsWidget';
import { LiveStudyRoomWidget } from '@/components/LiveStudyRoomWidget';
import { UserProfile, ExamEvent, StudyTask, StudyStats, ReminderSetting } from '@/types/exam';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_EXAMS,
  DEFAULT_STUDY_TASKS,
  DEFAULT_REMINDERS,
  playChimeSound,
} from '@/lib/constants';

const STORAGE_KEYS = {
  PROFILE: 'si_tu_2027_profile_v1',
  EXAMS: 'si_tu_2027_exams_v1',
  TASKS: 'si_tu_2027_tasks_v1',
  STATS: 'si_tu_2027_stats_v1',
  REMINDERS: 'si_tu_2027_reminders_v1',
};

export default function HomePage() {
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_USER_PROFILE;
  });

  const [exams, setExams] = useState<ExamEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
        if (saved) {
          let parsed: ExamEvent[] = JSON.parse(saved);
          let updated = false;

          // Merge separate vact-2027-d2 into single unified vact-2027
          const hadD2 = parsed.some((e) => e.id === 'vact-2027-d2');
          if (hadD2) {
            parsed = parsed.filter((e) => e.id !== 'vact-2027-d2');
            updated = true;
          }

          // Ensure default exams exist with updated names and subRounds
          DEFAULT_EXAMS.forEach((defExam) => {
            const existingIdx = parsed.findIndex((e) => e.id === defExam.id);
            if (existingIdx === -1) {
              parsed.push(defExam);
              updated = true;
            } else if (defExam.id === 'vact-2027' && (!parsed[existingIdx].subRounds || parsed[existingIdx].name !== defExam.name)) {
              parsed[existingIdx] = {
                ...parsed[existingIdx],
                name: defExam.name,
                shortName: defExam.shortName,
                badge: defExam.badge,
                description: defExam.description,
                tips: defExam.tips,
                subRounds: defExam.subRounds,
              };
              updated = true;
            }
          });

          if (updated) {
            localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_EXAMS;
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_STUDY_TASKS;
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_REMINDERS;
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.STATS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      streakDays: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      totalFocusMinutes: 0,
      completedTasksCount: 0,
      lastCheckInDate: '',
    };
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (!saved) return true;
        const parsed = JSON.parse(saved);
        return !parsed.isOnboarded;
      } catch {}
    }
    return false;
  });

  // Active online learners presence state
  const [isUserStudying, setIsUserStudying] = useState<boolean>(false);
  const [liveLearnerCount, setLiveLearnerCount] = useState<number>(() => {
    const hour = new Date().getHours();
    let base = 1250;
    if (hour >= 19 && hour <= 23) {
      base = 1890; // peak evening study session
    } else if (hour >= 13 && hour <= 18) {
      base = 1420; // afternoon study
    } else if (hour >= 5 && hour <= 8) {
      base = 980; // early morning review
    } else if (hour >= 0 && hour <= 4) {
      base = 420; // late night study
    }
    return base + Math.floor(Math.random() * 45);
  });

  // Subtle real-time fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLearnerCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(150, prev + delta);
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleUserStudying = () => {
    setIsUserStudying((prev) => {
      const next = !prev;
      setLiveLearnerCount((c) => (next ? c + 1 : Math.max(100, c - 1)));
      if (next) {
        playChimeSound('start');
      }
      return next;
    });
  };

  // Save profile to localStorage
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Save tasks to localStorage
  const handleUpdateTasks = (newTasks: StudyTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch (e) {
      console.error(e);
    }
  };

  // Save exams to localStorage
  const handleUpdateExams = (newExams: ExamEvent[]) => {
    setExams(newExams);
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(newExams));
    } catch (e) {
      console.error(e);
    }
  };

  // Save reminders to localStorage
  const handleUpdateReminders = (newReminders: ReminderSetting[]) => {
    setReminders(newReminders);
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(newReminders));
    } catch (e) {
      console.error(e);
    }
  };

  // Daily Check-In
  const handleDailyCheckIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newStats: StudyStats = {
      ...stats,
      streakDays: stats.lastCheckInDate ? stats.streakDays + 1 : 1,
      lastCheckInDate: today,
      lastActiveDate: today,
    };
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
    } catch (e) {
      console.error(e);
    }
  };

  // Focus Session Complete
  const handleSessionCompleted = (minutes: number) => {
    const newStats: StudyStats = {
      ...stats,
      totalFocusMinutes: (stats.totalFocusMinutes || 0) + minutes,
    };
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
    } catch (e) {
      console.error(e);
    }
  };

  // Task Completion Count
  const handleTaskCompleted = () => {
    const newStats: StudyStats = {
      ...stats,
      completedTasksCount: (stats.completedTasksCount || 0) + 1,
    };
    setStats(newStats);
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
    } catch (e) {
      console.error(e);
    }
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu về mặc định ban đầu không?')) {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      setProfile(DEFAULT_USER_PROFILE);
      setExams(DEFAULT_EXAMS);
      setTasks(DEFAULT_STUDY_TASKS);
      setReminders(DEFAULT_REMINDERS);
      setStats({
        streakDays: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        totalFocusMinutes: 0,
        completedTasksCount: 0,
        lastCheckInDate: '',
      });
      setIsOnboardingOpen(true);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-stone-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-purple-600 rounded-full animate-spin" />
          <span>Đang khởi động không gian ôn thi 2027...</span>
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Pinned Dream Hero Card: Directly pinned on top of the screen */}
        <PinnedDreamHero
          profile={profile}
          stats={stats}
          onEditGoal={() => setIsOnboardingOpen(true)}
          onDailyCheckIn={handleDailyCheckIn}
        />

        {/* Live Multi-Exam Countdown Section */}
        <CountdownGrid exams={exams} onUpdateExams={handleUpdateExams} />

        {/* Live 2K9 Virtual Study Room & Online Learners Statistics */}
        <LiveStudyRoomWidget
          isUserStudying={isUserStudying}
          onToggleUserStudying={handleToggleUserStudying}
          liveCount={liveLearnerCount}
        />

        {/* Two-Column Responsive Section: Study Planner (Left) & Widgets (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-8">
          {/* Smart Study Planner - 2 Columns wide on large screens */}
          <div className="lg:col-span-2">
            <SmartStudyPlanner
              tasks={tasks}
              profile={profile}
              onUpdateTasks={handleUpdateTasks}
              onTaskCompleted={handleTaskCompleted}
            />
          </div>

          {/* Widgets Sidebar: Pomodoro Focus + Notifications Reminder - 1 Column */}
          <div className="space-y-6">
            <PomodoroWidget
              onSessionCompleted={handleSessionCompleted}
              onRunningChange={(running) => setIsUserStudying(running)}
            />
            <ReminderNotificationCenter
              reminders={reminders}
              onUpdateReminders={handleUpdateReminders}
            />
          </div>
        </div>

        {/* Daily Exam Tips & Motivation Quotes Carousel */}
        <DailyTipsWidget />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/70 py-6 bg-white/60 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium text-stone-700">
            <span>Sĩ Tử 2027</span>
            <span>•</span>
            <span className="text-rose-600">Đồng hành cùng thế hệ 2K9 chinh phục kỳ thi GDPT mới</span>
            <span>•</span>
            <span className="text-stone-500">
              Code by{' '}
              <a
                href="https://github.com/NIrussVn0"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-semibold text-stone-800 hover:text-purple-700 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                title="GitHub: NirussVn0"
              >
                <span>NirussVn0</span>
                <span className="text-[10px] text-stone-400 font-sans font-normal">(GitHub)</span>
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>THPTQG 2027</span>
            <span>•</span>
            <span>V-ACT ĐHQG-HCM (Đợt 1 & 2)</span>
            <span>•</span>
            <span>HSA ĐHQG-HN</span>
            <span>•</span>
            <span>TSA HUST</span>
          </div>
        </div>
      </footer>

      {/* Onboarding / Set Target Goal Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialProfile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
