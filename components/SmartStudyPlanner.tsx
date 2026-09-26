'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Trash2,
  Clock,
  Wand2,
  Filter,
  Check,
  Zap,
  Edit2,
  ListTodo,
  CheckSquare,
  Square,
  Timer,
  X,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudyTask, SubjectTag, UserProfile, SubTaskItem } from '@/types/exam';
import { STUDY_TEMPLATES, playChimeSound } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface SmartStudyPlannerProps {
  tasks: StudyTask[];
  profile: UserProfile;
  onUpdateTasks: (tasks: StudyTask[]) => void;
  onTaskCompleted?: () => void;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'Thứ 2', short: 'T2' },
  { day: 2, label: 'Thứ 3', short: 'T3' },
  { day: 3, label: 'Thứ 4', short: 'T4' },
  { day: 4, label: 'Thứ 5', short: 'T5' },
  { day: 5, label: 'Thứ 6', short: 'T6' },
  { day: 6, label: 'Thứ 7', short: 'T7' },
  { day: 0, label: 'Chủ Nhật', short: 'CN' },
];

const SUBJECT_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  Toán: { bg: 'bg-sky-100/80', text: 'text-sky-800', border: 'border-sky-200' },
  'Ngữ Văn': { bg: 'bg-rose-100/80', text: 'text-rose-800', border: 'border-rose-200' },
  'Tiếng Anh': { bg: 'bg-amber-100/80', text: 'text-amber-800', border: 'border-amber-200' },
  'Vật Lí': { bg: 'bg-indigo-100/80', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Hóa Học': { bg: 'bg-emerald-100/80', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Sinh Học': { bg: 'bg-teal-100/80', text: 'text-teal-800', border: 'border-teal-200' },
  'Lịch Sử': { bg: 'bg-orange-100/80', text: 'text-orange-800', border: 'border-orange-200' },
  'Địa Lí': { bg: 'bg-lime-100/80', text: 'text-lime-800', border: 'border-lime-200' },
  'Tư Duy Logic (ĐGNL)': { bg: 'bg-purple-100/80', text: 'text-purple-800', border: 'border-purple-200' },
  'Đọc Hiểu (V-ACT/HSA)': { bg: 'bg-fuchsia-100/80', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
  Default: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
};

const DURATION_PRESETS = [30, 45, 60, 90, 120, 150];

export const SmartStudyPlanner: React.FC<SmartStudyPlannerProps> = ({
  tasks,
  profile,
  onUpdateTasks,
  onTaskCompleted,
}) => {
  const currentDayOfWeek = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek);
  const [isAllDays, setIsAllDays] = useState(false);
  const [filterExam, setFilterExam] = useState<string>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Add Task Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<string>('Toán');
  const [newDay, setNewDay] = useState<number>(selectedDay);
  const [newTimeSlot, setNewTimeSlot] = useState('19:30 - 21:00');
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newExamTarget, setNewExamTarget] = useState<'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả'>('THPTQG');
  const [newNotes, setNewNotes] = useState('');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  // Edit Task Modal state
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState<string>('Toán');
  const [editDay, setEditDay] = useState<number>(1);
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editDuration, setEditDuration] = useState<number>(60);
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [editExamTarget, setEditExamTarget] = useState<'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả'>('THPTQG');
  const [editNotes, setEditNotes] = useState('');
  const [editSubtasks, setEditSubtasks] = useState<SubTaskItem[]>([]);
  const [editSubtaskDraft, setEditSubtaskDraft] = useState('');

  // Quick inline subtask input on card
  const [quickSubtaskInput, setQuickSubtaskInput] = useState<{ [taskId: string]: string }>({});
  const [activeSubtaskInputTaskId, setActiveSubtaskInputTaskId] = useState<string | null>(null);

  // AI Generator Form
  const [weakSubjects, setWeakSubjects] = useState<string[]>(['Toán', 'Tư duy logic']);
  const [studyHours, setStudyHours] = useState(3);

  // Filtered Tasks
  const filteredTasks = tasks.filter((task) => {
    const matchDay = isAllDays ? true : task.dayOfWeek === selectedDay;
    const matchExam = filterExam === 'all' ? true : task.examTarget === filterExam || task.examTarget === 'Tất cả';
    return matchDay && matchExam;
  });

  const completedTodayCount = tasks.filter((t) => t.dayOfWeek === selectedDay && t.completed).length;
  const totalTodayCount = tasks.filter((t) => t.dayOfWeek === selectedDay).length;
  const completionPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  // Sync Task with Pomodoro & Stopwatch
  const handleSyncTaskWithTimer = (task: StudyTask) => {
    try {
      localStorage.setItem('si_tu_2027_active_task_id_v1', task.id);
      window.dispatchEvent(
        new CustomEvent('si_tu_2027_sync_timer_task', {
          detail: { taskId: task.id },
        })
      );
    } catch {}

    playChimeSound('start');
    setToastMessage(`🍅 Đã kết nối với ca học: "${task.title}". Sẵn sàng bấm giờ!`);
    setTimeout(() => setToastMessage(''), 4500);

    // If pomodoro widget is on the page, smoothly scroll to it
    const pomodoroEl = document.getElementById('pomodoro-station') || document.getElementById('pomodoro-card');
    if (pomodoroEl) {
      pomodoroEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const willBeCompleted = !task?.completed;

    const updated = tasks.map((t) => {
      if (t.id === id) {
        // If completing, also check all subtasks
        const updatedSubtasks = willBeCompleted && t.subtasks
          ? t.subtasks.map((s) => ({ ...s, completed: true }))
          : t.subtasks;
        return { ...t, completed: willBeCompleted, subtasks: updatedSubtasks };
      }
      return t;
    });

    onUpdateTasks(updated);

    if (willBeCompleted) {
      playChimeSound('complete');
      if (onTaskCompleted) onTaskCompleted();

      const remaining = tasks.filter((t) => t.dayOfWeek === selectedDay && t.id !== id && !t.completed).length;
      if (remaining === 0) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.5 },
            colors: ['#A7F3D0', '#BAE6FD', '#E9D5FF', '#FDE68A'],
          });
        } catch {}
      }
    }
  };

  // Toggle single subtask inside a task
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId && t.subtasks) {
        const nextSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = nextSubtasks.every((st) => st.completed);
        return {
          ...t,
          subtasks: nextSubtasks,
          completed: allCompleted ? true : t.completed,
        };
      }
      return t;
    });
    onUpdateTasks(updated);
    playChimeSound('click');
  };

  // Inline quick-add subtask
  const handleAddInlineSubtask = (taskId: string) => {
    const text = quickSubtaskInput[taskId]?.trim();
    if (!text) return;

    const newSubItem: SubTaskItem = {
      id: `sub-${Date.now()}`,
      title: text,
      completed: false,
    };

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...(t.subtasks || []), newSubItem],
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    setQuickSubtaskInput((prev) => ({ ...prev, [taskId]: '' }));
    setActiveSubtaskInputTaskId(null);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  // Open Edit Task Modal
  const handleOpenEditModal = (task: StudyTask) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditSubject(task.subject);
    setEditDay(task.dayOfWeek);
    setEditTimeSlot(task.timeSlot);
    setEditDuration(task.durationMinutes || 60);
    setEditPriority(task.priority);
    setEditExamTarget(task.examTarget);
    setEditNotes(task.notes || '');
    setEditSubtasks(task.subtasks ? [...task.subtasks] : []);
    setEditSubtaskDraft('');
  };

  // Save Edit Task
  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === editingTask.id) {
        return {
          ...t,
          title: editTitle.trim(),
          subject: editSubject,
          dayOfWeek: editDay,
          timeSlot: editTimeSlot.trim() || '19:30 - 20:30',
          durationMinutes: editDuration,
          priority: editPriority,
          examTarget: editExamTarget,
          notes: editNotes.trim() || undefined,
          subtasks: editSubtasks,
        };
      }
      return t;
    });

    onUpdateTasks(updatedTasks);
    setEditingTask(null);
    playChimeSound('click');
    setToastMessage(`✓ Đã cập nhật buổi học "${editTitle.trim()}" (${editDuration} phút)!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const initialSubtaskItems: SubTaskItem[] = newSubtasks.map((st, i) => ({
      id: `sub-${Date.now()}-${i}`,
      title: st,
      completed: false,
    }));

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      dayOfWeek: newDay,
      timeSlot: newTimeSlot.trim() || '19:30 - 20:30',
      durationMinutes: newDuration,
      completed: false,
      priority: newPriority,
      examTarget: newExamTarget,
      notes: newNotes.trim() || undefined,
      subtasks: initialSubtaskItems.length > 0 ? initialSubtaskItems : undefined,
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTitle('');
    setNewNotes('');
    setNewSubtasks([]);
    setSubtaskDraft('');
    setShowAddTaskModal(false);
    playChimeSound('click');
  };

  const handleApplyTemplate = (templateName: string) => {
    const chosen = STUDY_TEMPLATES.find((t) => t.name === templateName);
    if (!chosen) return;

    const templateTasks: StudyTask[] = [
      {
        id: `tpl-1-${Date.now()}`,
        title: `Ôn trọng tâm Chuyên đề 1 - ${chosen.subjects[0]}`,
        subject: chosen.subjects[0] || 'Toán',
        dayOfWeek: 1,
        timeSlot: '19:30 - 21:00',
        durationMinutes: 90,
        completed: false,
        priority: 'high',
        examTarget: 'THPTQG',
        notes: 'Luyện 30 câu trắc nghiệm dạng mới',
        subtasks: [
          { id: `st-1`, title: 'Quét lý thuyết SGK', completed: false },
          { id: `st-2`, title: 'Giải 20 câu trắc nghiệm', completed: false },
        ],
      },
      {
        id: `tpl-2-${Date.now()}`,
        title: `Chinh phục dạng bài ${chosen.subjects[1] || 'ĐGNL'}`,
        subject: chosen.subjects[1] || 'Tư Duy Logic (ĐGNL)',
        dayOfWeek: 2,
        timeSlot: '20:00 - 21:30',
        durationMinutes: 90,
        completed: false,
        priority: 'high',
        examTarget: 'V-ACT',
        notes: 'Tập trung rèn tốc độ suy luận nhanh',
      },
      {
        id: `tpl-3-${Date.now()}`,
        title: `Luyện đọc hiểu & viết đoạn ${chosen.subjects[2] || 'Ngữ Văn'}`,
        subject: chosen.subjects[2] || 'Ngữ Văn',
        dayOfWeek: 3,
        timeSlot: '19:30 - 20:30',
        durationMinutes: 60,
        completed: false,
        priority: 'medium',
        examTarget: 'THPTQG',
      },
      {
        id: `tpl-4-${Date.now()}`,
        title: `Củng cố kiến thức ${chosen.subjects[0]} nâng cao`,
        subject: chosen.subjects[0] || 'Toán',
        dayOfWeek: 4,
        timeSlot: '19:30 - 21:30',
        durationMinutes: 120,
        completed: false,
        priority: 'high',
        examTarget: 'THPTQG',
      },
      {
        id: `tpl-5-${Date.now()}`,
        title: `Luyện đề thi thử & phân tích bẫy đề`,
        subject: chosen.subjects[1] || 'Tư Duy Logic (ĐGNL)',
        dayOfWeek: 5,
        timeSlot: '20:00 - 21:30',
        durationMinutes: 90,
        completed: false,
        priority: 'high',
        examTarget: 'HSA',
      },
      {
        id: `tpl-6-${Date.now()}`,
        title: `Thi thử bấm giờ nghiêm túc 150 phút`,
        subject: 'Tư Duy Logic (ĐGNL)',
        dayOfWeek: 6,
        timeSlot: '08:00 - 10:30',
        durationMinutes: 150,
        completed: false,
        priority: 'high',
        examTarget: 'V-ACT',
        notes: 'Tập trung tâm lý phòng thi thực chiến',
      },
      {
        id: `tpl-7-${Date.now()}`,
        title: `Sửa lỗi sai, hệ thống sơ đồ & nghỉ ngơi`,
        subject: 'Toán',
        dayOfWeek: 0,
        timeSlot: '19:30 - 20:15',
        durationMinutes: 45,
        completed: false,
        priority: 'medium',
        examTarget: 'Tất cả',
      },
    ];

    onUpdateTasks(templateTasks);
    playChimeSound('complete');
  };

  const handleGenerateAiPlan = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: profile.targetUniversity,
          major: profile.targetMajor,
          targetScore: profile.targetScore,
          weakSubjects,
          hoursPerDay: studyHours,
          targetExams: ['THPTQG 2027', 'V-ACT 2027', 'HSA 2027'],
        }),
      });

      const data = await res.json();
      if (data.plan && Array.isArray(data.plan)) {
        const newAiTasks: StudyTask[] = data.plan.map((item: {
          dayOfWeek: number;
          subject: string;
          timeSlot: string;
          durationMinutes: number;
          task: string;
          examTarget: string;
          tip?: string;
        }, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          title: item.task,
          subject: item.subject,
          dayOfWeek: item.dayOfWeek,
          timeSlot: item.timeSlot || '19:30 - 21:00',
          durationMinutes: item.durationMinutes || 60,
          completed: false,
          priority: 'high',
          examTarget: (item.examTarget as 'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả') || 'THPTQG',
          notes: item.tip,
        }));

        onUpdateTasks(newAiTasks);
        setAiAdvice(data.advice || '');
        playChimeSound('complete');
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-purple-900 text-white text-xs font-semibold shadow-lg flex items-center justify-between gap-3 border border-purple-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-stone-300 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Schedule Container */}
      <div className="p-5 md:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              <h2 className="text-base md:text-lg font-bold text-stone-900">
                Lịch Học Tập Thông Minh 2K9
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              💡 <strong>Mẹo:</strong> Click 2 lần vào ca học để đồng bộ với Pomodoro / Đồng hồ bấm giờ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-2xs"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Cố Vấn Lộ Trình</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewDay(selectedDay);
                setShowAddTaskModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Buổi Học</span>
            </button>
          </div>
        </div>

        {/* Days of Week Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-stone-100/80 rounded-2xl no-scrollbar">
            <button
              type="button"
              onClick={() => setIsAllDays(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                isAllDays
                  ? 'bg-stone-900 text-white font-semibold shadow-2xs border-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border-transparent'
              }`}
            >
              Cả Tuần
            </button>

            {DAYS_OF_WEEK.map((d) => {
              const isSelected = !isAllDays && selectedDay === d.day;
              const isToday = currentDayOfWeek === d.day;
              const countForDay = tasks.filter((t) => t.dayOfWeek === d.day).length;

              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => {
                    setIsAllDays(false);
                    setSelectedDay(d.day);
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-purple-600 text-white font-semibold shadow-2xs border-purple-600'
                      : isToday
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-transparent'
                  }`}
                >
                  <span>{d.label}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Hôm nay" />
                  )}
                  {countForDay > 0 && (
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-stone-200/80 text-stone-600'
                      }`}
                    >
                      {countForDay}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Exam Tag Filters */}
          <div className="flex items-center gap-1 self-end sm:self-auto text-xs">
            <span className="text-stone-400 mr-1 flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3" /> Lọc:
            </span>
            {['all', 'THPTQG', 'V-ACT', 'HSA'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterExam(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  filterExam === tag
                    ? 'bg-stone-800 text-white font-medium'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {tag === 'all' ? 'Tất cả' : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Completion Header */}
        {!isAllDays && totalTodayCount > 0 && (
          <div className="flex items-center justify-between py-3 px-3.5 my-3 rounded-2xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-stone-700">
                Tiến độ {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label}:
              </div>
              <span className="text-xs font-bold text-stone-900">
                {completedTodayCount}/{totalTodayCount} nhiệm vụ
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 md:w-36 h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-700 min-w-[32px] text-right">
                {completionPercent}%
              </span>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3 mt-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50">
              <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-stone-700">
                Chưa có buổi học nào được lên lịch cho khung này!
              </div>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1 mb-4">
                Hãy thêm buổi học hoặc chọn một trong các lộ trình mẫu tối ưu hóa sẵn bên dưới để bắt đầu ngay.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  + Thêm buổi học
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(STUDY_TEMPLATES[0].name)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors"
                >
                  Nạp Lộ Trình Mẫu Khối A
                </button>
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const colorInfo = SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.Default;
              const dayObj = DAYS_OF_WEEK.find((d) => d.day === task.dayOfWeek);
              const subtasks = task.subtasks || [];
              const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDoubleClick={() => handleSyncTaskWithTimer(task)}
                  className={`group relative p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    task.completed
                      ? 'bg-stone-50/80 border-stone-200 text-stone-400'
                      : 'bg-white border-stone-200/90 hover:border-purple-300 shadow-2xs hover:shadow-xs'
                  }`}
                  title="Nhấn đúp (click 2 lần) để kết nối Pomodoro / Bấm giờ"
                >
                  {/* Top Task Row */}
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-stone-400 hover:text-purple-600 transition-colors shrink-0"
                      title={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-purple-500" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Subject Tag */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}
                          >
                            {task.subject}
                          </span>

                          {/* Exam Target */}
                          {task.examTarget && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                              {task.examTarget}
                            </span>
                          )}

                          {/* Day label if in "Cả tuần" view */}
                          {isAllDays && dayObj && (
                            <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                              {dayObj.label}
                            </span>
                          )}
                        </div>

                        {/* Duration & Time slot badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60 shrink-0 font-mono">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{task.timeSlot}</span>
                            <span className="text-stone-300">•</span>
                            <span className="font-bold text-stone-800">{task.durationMinutes}p</span>
                            {task.loggedFocusMinutes !== undefined && task.loggedFocusMinutes > 0 && (
                              <span className="text-emerald-700 font-semibold ml-0.5 bg-emerald-50 px-1 rounded">
                                +{task.loggedFocusMinutes}p
                              </span>
                            )}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSyncTaskWithTimer(task)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors"
                              title="Kết nối ca học này với Trạm Pomodoro / Bấm giờ (Hoặc click 2 lần vào ca học)"
                            >
                              <span>🍅</span>
                              <span className="hidden sm:inline">Bấm giờ</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(task)}
                              className="text-stone-400 hover:text-purple-600 p-1 rounded-lg transition-colors hover:bg-stone-100"
                              title="Sửa ca học & thời lượng"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-stone-300 hover:text-rose-500 p-1 rounded-lg transition-colors hover:bg-stone-100"
                              title="Xóa buổi học này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Task Title */}
                      <div
                        className={`text-xs md:text-sm font-semibold select-none ${
                          task.completed ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {task.title}
                      </div>

                      {/* Notes / Tips */}
                      {task.notes && (
                        <div className="text-[11px] text-stone-500 mt-1 flex items-start gap-1 italic">
                          <span className="text-purple-400">💡</span>
                          <span>{task.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtasks Checklist Section */}
                  {subtasks.length > 0 && (
                    <div className="pl-8 pt-2 border-t border-stone-100">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <ListTodo className="w-3.5 h-3.5 text-purple-600" />
                          <span>Việc nhỏ ({completedSubtasksCount}/{subtasks.length}):</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600">
                          {Math.round((completedSubtasksCount / subtasks.length) * 100)}%
                        </span>
                      </div>

                      {/* Subtask list */}
                      <div className="space-y-1">
                        {subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSubtask(task.id, st.id);
                            }}
                            className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer text-xs group/st"
                          >
                            <button
                              type="button"
                              className="text-stone-400 hover:text-emerald-600 shrink-0"
                            >
                              {st.completed ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-stone-300" />
                              )}
                            </button>
                            <span className={`${st.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline quick-add subtask input */}
                  <div className="pl-8 flex items-center gap-2">
                    {activeSubtaskInputTaskId === task.id ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={quickSubtaskInput[task.id] || ''}
                          onChange={(e) =>
                            setQuickSubtaskInput((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInlineSubtask(task.id);
                            } else if (e.key === 'Escape') {
                              setActiveSubtaskInputTaskId(null);
                            }
                          }}
                          placeholder="Thêm việc nhỏ (nhấn Enter để lưu)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInlineSubtask(task.id)}
                          className="px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubtaskInputTaskId(null)}
                          className="p-1 text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSubtaskInputTaskId(task.id)}
                        className="text-[11px] text-stone-400 hover:text-purple-600 flex items-center gap-1 py-0.5 hover:underline"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>+ Thêm việc nhỏ (subtask)</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Templates Drawer */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi Ý Lộ Trình Ôn Thi Chuẩn 2K9</span>
            </div>
            <span className="text-[11px] text-stone-400">1-click áp dụng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STUDY_TEMPLATES.map((tpl) => (
              <div
                key={tpl.name}
                className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:bg-stone-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-xs md:text-sm text-stone-900 mb-0.5">
                    {tpl.name}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-stone-200/50">
                  <div className="flex flex-wrap gap-1">
                    {tpl.subjects.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] bg-white px-1.5 py-0.5 rounded text-stone-600 border border-stone-200">
                        {s}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.name)}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2 py-1 rounded-lg hover:bg-purple-100/60 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD TASK MODAL (With full duration picker & subtasks) */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900">Thêm Buổi Học Mới</h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">Lên lịch cụ thể với thời lượng tùy ý và danh sách việc nhỏ.</p>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nội dung buổi học *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Giải 30 câu chuyên đề Hàm số trắc nghiệm đúng/sai..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Môn học</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {Object.keys(SUBJECT_COLORS).filter(k => k !== 'Default').map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Thứ trong tuần</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.day} value={d.day}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DURATION PICKER (FIX FOR: task mặc định 90p ko thể chỉnh) */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Thời lượng buổi học: <span className="text-purple-700 text-sm font-extrabold">{newDuration} phút</span></span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNewDuration((d) => Math.max(15, d - 15))}
                      className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100"
                    >
                      -15p
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDuration((d) => d + 15)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100"
                    >
                      +15p
                    </button>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setNewDuration(p);
                        setNewTimeSlot(`19:30 - ${19 + Math.floor((30 + p) / 60)}:${String((30 + p) % 60).padStart(2, '0')}`);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                        newDuration === p
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-purple-100/50 border-purple-100'
                      }`}
                    >
                      {p} phút
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={10}
                      max={360}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Math.max(5, Number(e.target.value)))}
                      className="w-16 px-2 py-1 text-xs text-center font-bold bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <span className="text-[11px] text-purple-900 font-medium">phút</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Khung giờ</label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    placeholder="19:30 - 21:00"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mục tiêu kỳ thi</label>
                  <select
                    value={newExamTarget}
                    onChange={(e) => setNewExamTarget(e.target.value as 'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả')}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="THPTQG">THPTQG</option>
                    <option value="V-ACT">V-ACT (ĐHQG-HCM)</option>
                    <option value="HSA">HSA (ĐHQG-HN)</option>
                    <option value="Tất cả">Tất cả</option>
                  </select>
                </div>
              </div>

              {/* Subtasks Builder in Add Task */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">Việc nhỏ (Subtasks) cần làm trong buổi này</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={subtaskDraft}
                    onChange={(e) => setSubtaskDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (subtaskDraft.trim()) {
                          setNewSubtasks([...newSubtasks, subtaskDraft.trim()]);
                          setSubtaskDraft('');
                        }
                      }
                    }}
                    placeholder="Nhập việc nhỏ (ví dụ: Làm 15 câu đầu...) rồi bấm Thêm"
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (subtaskDraft.trim()) {
                        setNewSubtasks([...newSubtasks, subtaskDraft.trim()]);
                        setSubtaskDraft('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-stone-200 hover:bg-stone-300 rounded-xl text-stone-700"
                  >
                    + Thêm
                  </button>
                </div>

                {newSubtasks.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {newSubtasks.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60">
                        <span className="text-stone-700">• {st}</span>
                        <button
                          type="button"
                          onClick={() => setNewSubtasks(newSubtasks.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ghi chú / Mẹo ôn tập</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ví dụ: Chú ý công thức bấm máy tính Casio..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
                >
                  Lưu buổi học ({newDuration}p)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>Chỉnh Sửa Ca Học</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">Cập nhật nội dung, thời lượng số phút và danh sách việc nhỏ.</p>

            <form onSubmit={handleSaveEditTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nội dung buổi học *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Môn học</label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {Object.keys(SUBJECT_COLORS).filter(k => k !== 'Default').map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Thứ trong tuần</label>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.day} value={d.day}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DURATION PICKER IN EDIT */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Thời lượng buổi học: <span className="text-purple-700 text-sm font-extrabold">{editDuration} phút</span></span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditDuration((d) => Math.max(15, d - 15))}
                      className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100"
                    >
                      -15p
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDuration((d) => d + 15)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100"
                    >
                      +15p
                    </button>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {DURATION_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditDuration(p)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                        editDuration === p
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-purple-100/50 border-purple-100'
                      }`}
                    >
                      {p} phút
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={10}
                      max={360}
                      value={editDuration}
                      onChange={(e) => setEditDuration(Math.max(5, Number(e.target.value)))}
                      className="w-16 px-2 py-1 text-xs text-center font-bold bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <span className="text-[11px] text-purple-900 font-medium">phút</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Khung giờ</label>
                  <input
                    type="text"
                    value={editTimeSlot}
                    onChange={(e) => setEditTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mục tiêu kỳ thi</label>
                  <select
                    value={editExamTarget}
                    onChange={(e) => setEditExamTarget(e.target.value as 'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả')}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="THPTQG">THPTQG</option>
                    <option value="V-ACT">V-ACT (ĐHQG-HCM)</option>
                    <option value="HSA">HSA (ĐHQG-HN)</option>
                    <option value="Tất cả">Tất cả</option>
                  </select>
                </div>
              </div>

              {/* Subtasks in Edit Task */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Danh sách việc nhỏ (Subtasks)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editSubtaskDraft}
                    onChange={(e) => setEditSubtaskDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editSubtaskDraft.trim()) {
                          setEditSubtasks([
                            ...editSubtasks,
                            { id: `sub-${Date.now()}`, title: editSubtaskDraft.trim(), completed: false },
                          ]);
                          setEditSubtaskDraft('');
                        }
                      }
                    }}
                    placeholder="Thêm việc nhỏ..."
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editSubtaskDraft.trim()) {
                        setEditSubtasks([
                          ...editSubtasks,
                          { id: `sub-${Date.now()}`, title: editSubtaskDraft.trim(), completed: false },
                        ]);
                        setEditSubtaskDraft('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-stone-200 hover:bg-stone-300 rounded-xl text-stone-700"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="space-y-1 mt-2">
                  {editSubtasks.map((st) => (
                    <div key={st.id} className="flex items-center justify-between text-xs bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() =>
                            setEditSubtasks(
                              editSubtasks.map((s) => (s.id === st.id ? { ...s, completed: !s.completed } : s))
                            )
                          }
                          className="rounded text-purple-600 focus:ring-purple-400"
                        />
                        <span className={st.completed ? 'line-through text-stone-400' : 'text-stone-800'}>
                          {st.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditSubtasks(editSubtasks.filter((s) => s.id !== st.id))}
                        className="text-stone-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ghi chú / Mẹo ôn tập</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
                >
                  Cập nhật ca học ({editDuration}p)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Smart Roadmap Advisor Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl border border-stone-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">AI Cố Vấn Phân Bổ Lịch Học 2K9</h3>
                <p className="text-xs text-stone-500">
                  Dựa vào trường NV1 ({profile.targetUniversity || 'Bách Khoa'}) và năng lực của bạn để tự động lập thời khóa biểu khoa học.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Môn học bạn cảm thấy cần ưu tiên bổ sung kiến thức nhất:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lí', 'Hóa Học', 'Tư duy logic', 'Đọc hiểu ĐGNL'].map((sub) => {
                    const isSelected = weakSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          if (isSelected) setWeakSubjects(weakSubjects.filter((s) => s !== sub));
                          else setWeakSubjects([...weakSubjects, sub]);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition-all border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-2xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {sub} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Thời lượng tự học mỗi ngày của bạn: <span className="text-purple-700 font-bold">{studyHours} giờ/ngày</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>1 giờ (Thong thả)</span>
                  <span>3 giờ (Khuyến nghị 2K9)</span>
                  <span>6 giờ (Cày thần tốc)</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/60 text-xs text-purple-900 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-purple-950">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Dữ liệu ghim của bạn:</span>
                </div>
                <div>• Trường: <span className="font-semibold">{profile.targetUniversity}</span></div>
                <div>• Ngành: <span className="font-semibold">{profile.targetMajor}</span></div>
                <div>• Mục tiêu: <span className="font-semibold">{profile.targetScore}</span></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Đóng
                </button>
                <button
                  id="btn-run-ai-generator"
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={async () => {
                    await handleGenerateAiPlan();
                    setShowAiModal(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xs disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kiến tạo lộ trình...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Tạo Lịch Ôn Cá Nhân Hóa ✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
