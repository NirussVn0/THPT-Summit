'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, ExamEvent, StudyTask, StudyStats, ReminderSetting } from '@/types/exam';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_EXAMS,
  DEFAULT_STUDY_TASKS,
  DEFAULT_REMINDERS,
  playChimeSound,
} from '@/lib/constants';

export const STORAGE_KEYS = {
  PROFILE: 'si_tu_2027_profile_v1',
  EXAMS: 'si_tu_2027_exams_v1',
  TASKS: 'si_tu_2027_tasks_v1',
  STATS: 'si_tu_2027_stats_v1',
  REMINDERS: 'si_tu_2027_reminders_v1',
  LIVE_STUDYING: 'si_tu_2027_is_studying_v1',
};

export function useStudyStorage() {
  const isLoaded = true;

  const [profile, setProfileState] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_USER_PROFILE;
  });

  const [exams, setExamsState] = useState<ExamEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
        if (saved) {
          let parsed: ExamEvent[] = JSON.parse(saved);
          parsed = parsed.filter((e) => e.id !== 'vact-2027-d2');
          DEFAULT_EXAMS.forEach((defExam) => {
            const idx = parsed.findIndex((e) => e.id === defExam.id);
            if (idx === -1) parsed.push(defExam);
            else {
              parsed[idx].targetDate = defExam.targetDate;
              parsed[idx].subRounds = defExam.subRounds;
            }
          });
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_EXAMS;
  });

  const [tasks, setTasksState] = useState<StudyTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_STUDY_TASKS;
  });

  const [reminders, setRemindersState] = useState<ReminderSetting[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_REMINDERS;
  });

  const [stats, setStatsState] = useState<StudyStats>(() => {
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

  const [isUserStudying, setIsUserStudyingState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.LIVE_STUDYING) === 'true';
      } catch {}
    }
    return false;
  });

  const [liveLearnerCount, setLiveLearnerCount] = useState<number>(() => {
    const hour = new Date().getHours();
    let base = 1250;
    if (hour >= 19 && hour <= 23) base = 1890;
    else if (hour >= 13 && hour <= 18) base = 1420;
    else if (hour >= 5 && hour <= 8) base = 980;
    else if (hour >= 0 && hour <= 4) base = 420;
    return base + 15;
  });

  // Storage event synchronization across tabs/pages
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === STORAGE_KEYS.TASKS && e.newValue) {
          setTasksState(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.STATS && e.newValue) {
          setStatsState(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.PROFILE && e.newValue) {
          setProfileState(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.REMINDERS && e.newValue) {
          setRemindersState(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.LIVE_STUDYING) {
          setIsUserStudyingState(e.newValue === 'true');
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Subtle real-time fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLearnerCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(150, prev + delta);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Setters with localStorage writes
  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfileState(newProfile);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch {}
  }, []);

  const updateExams = useCallback((newExams: ExamEvent[]) => {
    setExamsState(newExams);
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(newExams));
    } catch {}
  }, []);

  const updateTasks = useCallback((newTasks: StudyTask[]) => {
    setTasksState(newTasks);
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch {}
  }, []);

  const updateReminders = useCallback((newReminders: ReminderSetting[]) => {
    setRemindersState(newReminders);
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(newReminders));
    } catch {}
  }, []);

  const updateStats = useCallback((newStats: StudyStats) => {
    setStatsState(newStats);
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
    } catch {}
  }, []);

  const handleDailyCheckIn = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setStatsState((prev) => {
      const next: StudyStats = {
        ...prev,
        streakDays: prev.lastCheckInDate ? prev.streakDays + 1 : 1,
        lastCheckInDate: today,
        lastActiveDate: today,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleSessionCompleted = useCallback((minutes: number) => {
    setStatsState((prev) => {
      const next: StudyStats = {
        ...prev,
        totalFocusMinutes: (prev.totalFocusMinutes || 0) + minutes,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleTaskCompleted = useCallback(() => {
    setStatsState((prev) => {
      const next: StudyStats = {
        ...prev,
        completedTasksCount: (prev.completedTasksCount || 0) + 1,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleToggleUserStudying = useCallback(() => {
    setIsUserStudyingState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.LIVE_STUDYING, String(next));
      } catch {}
      setLiveLearnerCount((c) => (next ? c + 1 : Math.max(100, c - 1)));
      if (next) playChimeSound('start');
      return next;
    });
  }, []);

  const handleResetData = useCallback(() => {
    if (confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu về mặc định ban đầu không?')) {
      try {
        localStorage.clear();
      } catch {}
      setProfileState(DEFAULT_USER_PROFILE);
      setExamsState(DEFAULT_EXAMS);
      setTasksState(DEFAULT_STUDY_TASKS);
      setRemindersState(DEFAULT_REMINDERS);
      setStatsState({
        streakDays: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        totalFocusMinutes: 0,
        completedTasksCount: 0,
        lastCheckInDate: '',
      });
      setIsUserStudyingState(false);
    }
  }, []);

  return {
    isLoaded,
    profile,
    exams,
    tasks,
    reminders,
    stats,
    isUserStudying,
    liveLearnerCount,
    updateProfile,
    updateExams,
    updateTasks,
    updateReminders,
    updateStats,
    handleDailyCheckIn,
    handleSessionCompleted,
    handleTaskCompleted,
    handleToggleUserStudying,
    handleResetData,
  };
}
