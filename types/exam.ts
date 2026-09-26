export type PastelTheme = 'lavender' | 'rose' | 'sage' | 'sky' | 'peach';

export interface UserProfile {
  studentName: string;
  targetUniversity: string;
  universityShort: string;
  targetMajor: string;
  targetScore: string;
  motto: string;
  examCombinations: string[];
  themeColor: PastelTheme;
  isOnboarded: boolean;
  avatarIcon?: string;
  createdAt?: string;
}

export interface ExamEvent {
  id: string;
  name: string;
  shortName: string;
  targetDate: string; // ISO string e.g. "2027-06-25T07:30:00"
  description: string;
  badge: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    progressFill: string;
  };
  tips: string[];
  totalQuestionCount?: number;
  durationMinutes?: number;
  isCustom?: boolean;
  subRounds?: {
    id: string;
    name: string;
    shortName: string;
    targetDate: string;
    description: string;
    reference2026?: string;
  }[];
}

export type SubjectTag =
  | 'Toán'
  | 'Ngữ Văn'
  | 'Tiếng Anh'
  | 'Vật Lí'
  | 'Hóa Học'
  | 'Sinh Học'
  | 'Lịch Sử'
  | 'Địa Lí'
  | 'Tin Học'
  | 'Tư Duy Logic (ĐGNL)'
  | 'Đọc Hiểu (V-ACT/HSA)'
  | 'Khoa Học Tự Nhiên'
  | 'Khoa Học Xã Hội';

export interface StudyTask {
  id: string;
  title: string;
  subject: SubjectTag | string;
  dayOfWeek: number; // 0: CN, 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7
  timeSlot: string; // "19:30 - 21:00"
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  examTarget: 'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả';
  notes?: string;
  loggedFocusMinutes?: number;
}

export interface PomodoroSettings {
  focusMinutes: number; // default 25
  shortBreakMinutes: number; // default 5
  longBreakMinutes: number; // default 15
  longBreakInterval: number; // default 4
  autoStartBreaks: boolean; // default false
  autoStartFocus: boolean; // default false
  soundEnabled: boolean; // default true
  syncWithSchedule: boolean; // default true
  ambientSound: 'none' | 'whitenoise' | 'rain' | 'clock' | 'waves';
}

export interface StudyStats {
  streakDays: number;
  lastActiveDate: string;
  totalFocusMinutes: number;
  completedTasksCount: number;
  lastCheckInDate?: string;
}

export interface ReminderSetting {
  id: string;
  title: string;
  time: string; // "20:00"
  enabled: boolean;
  repeat: 'daily' | 'weekdays' | 'custom';
  description: string;
}
