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
  GripVertical,
  ArrowUpDown,
  Bot,
} from 'lucide-react';
import { StudyTask, SubjectTag, UserProfile, SubTaskItem } from '@/types/exam';
import { STUDY_TEMPLATES, playChimeSound, DAYS_OF_WEEK } from '@/lib/constants';
import { setGlobalPomodoroState } from '@/lib/pomodoroState';
import { parseRawMarkdownTasks, isMarkdownTodoList } from '@/lib/markdownTodoParser';
import confetti from 'canvas-confetti';

interface SmartStudyPlannerProps {
  tasks: StudyTask[];
  profile: UserProfile;
  onUpdateTasks: (tasks: StudyTask[]) => void;
  onTaskCompleted?: () => void;
}

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

  // Drag and drop task reordering state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Gemini AI Hub modal state
  const [aiTab, setAiTab] = useState<'generate' | 'classify' | 'sort'>('generate');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [targetAiExam, setTargetAiExam] = useState<'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả'>('THPTQG');
  const [generatedAiTasks, setGeneratedAiTasks] = useState<StudyTask[]>([]);
  const [aiSortResult, setAiSortResult] = useState<{ tasks: StudyTask[]; explanation: string } | null>(null);
  const [aiClassifyResult, setAiClassifyResult] = useState<{ tasks: StudyTask[]; summary: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
      localStorage.setItem('si_tu_2027_synced_day_v1', String(task.dayOfWeek));
      setGlobalPomodoroState({
        syncedDay: task.dayOfWeek,
        activeTaskId: task.id,
      });
      window.dispatchEvent(
        new CustomEvent('si_tu_2027_sync_timer_task', {
          detail: { taskId: task.id },
        })
      );
      window.dispatchEvent(
        new CustomEvent('si_tu_2027_switch_phong_hoc_tab', {
          detail: { tab: 'pomodoro' },
        })
      );
    } catch {}

    playChimeSound('start');
    setToastMessage(`🍅 Đã kết nối với ca học: "${task.title}". Tự động chuyển sang Trạm Pomodoro!`);
    setTimeout(() => setToastMessage(''), 4500);

    // If pomodoro widget is on the page, smoothly scroll to it
    const pomodoroEl = document.getElementById('pomodoro-station') || document.getElementById('pomodoro-focus-widget');
    if (pomodoroEl) {
      pomodoroEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Sync Entire Day's Tasks with Pomodoro Queue (Auto-Sync: Xong task đầu tự done rồi tự qua task tiếp)
  const handleSyncDayWithPomodoro = (day: number, dayLabel?: string) => {
    const dayName = dayLabel || DAYS_OF_WEEK.find((d) => d.day === day)?.label || `Thứ ${day + 1}`;
    const dayTasks = tasks.filter((t) => t.dayOfWeek === day);

    try {
      localStorage.setItem('si_tu_2027_synced_day_v1', String(day));
      const firstUnfinished = dayTasks.find((t) => !t.completed) || dayTasks[0];
      if (firstUnfinished) {
        localStorage.setItem('si_tu_2027_active_task_id_v1', firstUnfinished.id);
      }
      setGlobalPomodoroState({
        syncedDay: day,
        activeTaskId: firstUnfinished ? firstUnfinished.id : null,
      });

      window.dispatchEvent(
        new CustomEvent('si_tu_2027_sync_day_queue', {
          detail: {
            dayOfWeek: day,
            dayLabel: dayName,
            firstTaskId: firstUnfinished?.id,
          },
        })
      );
    } catch {}

    playChimeSound('start');
    if (dayTasks.length > 0) {
      setToastMessage(
        `🍅 Đã tự động kết nối ${dayTasks.length} bài học của ${dayName} vào Pomodoro! Xong bài 1 tự done & tự chuyển qua bài tiếp theo.`
      );
    } else {
      setToastMessage(`📅 Đã chọn ${dayName}. Hãy thêm bài học để tự động kết nối Pomodoro!`);
    }
    setTimeout(() => setToastMessage(''), 4500);
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

  // Drag and drop task reordering
  const handleReorderTasks = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const sourceIndex = tasks.findIndex((t) => t.id === sourceId);
    const targetIndex = tasks.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextTasks = [...tasks];
    const [moved] = nextTasks.splice(sourceIndex, 1);
    nextTasks.splice(targetIndex, 0, moved);

    onUpdateTasks(nextTasks);
    playChimeSound('click');

    // Sync first uncompleted task of selectedDay with Pomodoro
    const dayTasks = nextTasks.filter((t) => t.dayOfWeek === selectedDay);
    const firstUnfinished = dayTasks.find((t) => !t.completed);
    if (firstUnfinished) {
      setGlobalPomodoroState({
        activeTaskId: firstUnfinished.id,
        syncedDay: selectedDay,
      });
    }

    setToastMessage('✓ Đã cập nhật thứ tự ca học! Ca đầu tiên sẽ tự động đồng bộ vào Pomodoro.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleMoveTaskOrder = (taskId: string, direction: 'up' | 'down') => {
    const dayTasks = tasks.filter((t) => t.dayOfWeek === selectedDay);
    const currentIndex = dayTasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= dayTasks.length) return;

    const targetTask = dayTasks[targetIndex];
    handleReorderTasks(taskId, targetTask.id);
  };

  // 1. Generate tasks with Gemini AI (with resilient Markdown Todo Parser fallback)
  const handleGenerateAiTasks = async () => {
    setIsAiLoading(true);
    const trimmedPrompt = customAiPrompt.trim();

    try {
      const res = await fetch('/api/gemini/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          payload: {
            university: profile.targetUniversity,
            major: profile.targetMajor,
            targetScore: profile.targetScore,
            weakSubjects,
            hoursPerDay: studyHours,
            dayOfWeek: selectedDay,
            targetExams: targetAiExam === 'Tất cả' ? ['THPTQG 2027', 'V-ACT 2027', 'HSA 2027'] : [targetAiExam],
            customPrompt: trimmedPrompt,
          },
        }),
      });

      let data: any = null;
      if (res.ok) {
        try {
          data = await res.json();
        } catch {
          // JSON parsing failed from response
        }
      }

      // If server failed or returned no tasks, but user provided markdown todo notes:
      if (!data || !data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
        if (isMarkdownTodoList(trimmedPrompt)) {
          data = parseRawMarkdownTasks(trimmedPrompt, selectedDay);
        }
      }

      if (data && data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        setGeneratedAiTasks(data.tasks);
        setAiAdvice(data.advice || 'Đã tạo và tối ưu hóa thành công các ca học cho ngày này!');
        playChimeSound('complete');
      } else {
        // Fallback default sample task
        setGeneratedAiTasks([
          {
            id: `task-fb-${Date.now()}-1`,
            title: 'Luyện 20 câu trọng điểm Toán & ĐGNL',
            subject: 'Toán',
            dayOfWeek: selectedDay,
            timeSlot: '19:30 - 21:00',
            durationMinutes: 90,
            completed: false,
            priority: 'high',
            examTarget: 'THPTQG',
            notes: 'Tập trung các dạng câu hỏi vận dụng cao GDPT 2018.',
            subtasks: [
              { id: `st-fb-1`, title: 'Ôn lý thuyết và công thức', completed: false },
              { id: `st-fb-2`, title: 'Giải bài tập trắc nghiệm', completed: false },
            ],
          },
        ]);
        setAiAdvice('Hãy kiên trì theo sát kế hoạch học tập hàng ngày!');
      }
    } catch (err) {
      console.warn('Network or client error in handleGenerateAiTasks:', err);
      // Run local parser fallback immediately if user pasted markdown
      if (isMarkdownTodoList(trimmedPrompt)) {
        const localParsed = parseRawMarkdownTasks(trimmedPrompt, selectedDay);
        if (localParsed.tasks.length > 0) {
          setGeneratedAiTasks(localParsed.tasks);
          setAiAdvice(localParsed.advice);
          playChimeSound('complete');
          return;
        }
      }
      alert('Đã xảy ra sự cố kết nối. Vui lòng kiểm tra lại mạng hoặc thử lại sau.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddGeneratedTasksToSchedule = (newItems: StudyTask[]) => {
    const nextTasks = [...tasks, ...newItems];
    onUpdateTasks(nextTasks);
    playChimeSound('complete');
    try {
      confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
    } catch {}
    setShowAiModal(false);
    setGeneratedAiTasks([]);
    setToastMessage(`✨ Đã thêm ${newItems.length} ca học AI vào ${DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 2. Classify tasks with Gemini AI
  const handleClassifyTasks = async () => {
    const dayTasks = tasks.filter((t) => t.dayOfWeek === selectedDay);
    if (dayTasks.length === 0) {
      alert('Chưa có ca học nào trong ngày này để phân loại!');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'classify',
          payload: { tasks: dayTasks },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          setAiClassifyResult({
            tasks: data.tasks,
            summary: data.summary || '',
          });
          playChimeSound('complete');
        }
      } else {
        // Fallback local classification
        const classified = dayTasks.map((t) => ({
          ...t,
          examTarget: t.examTarget || 'THPTQG',
          priority: t.priority || 'high',
        }));
        setAiClassifyResult({
          tasks: classified,
          summary: 'Đã chuẩn hóa phân loại môn học và kỳ thi trọng điểm theo chương trình GDPT 2018.',
        });
        playChimeSound('complete');
      }
    } catch (err) {
      console.warn('Classify tasks error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyClassifiedTasks = () => {
    if (!aiClassifyResult) return;
    const classifiedMap = new Map(aiClassifyResult.tasks.map((t) => [t.id, t]));
    const nextTasks = tasks.map((t) => classifiedMap.get(t.id) || t);
    onUpdateTasks(nextTasks);
    playChimeSound('complete');
    setShowAiModal(false);
    setAiClassifyResult(null);
    setToastMessage('✨ Đã áp dụng chuẩn hóa phân loại môn và kỳ thi từ Gemini AI!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 3. Smart Sort tasks with Gemini (Chronobiology & Learning Science)
  const handleSortTasks = async () => {
    const dayTasks = tasks.filter((t) => t.dayOfWeek === selectedDay);
    if (dayTasks.length < 2) {
      alert('Cần ít nhất 2 ca học trong ngày để AI phân tích và sắp xếp thứ tự!');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sort',
          payload: {
            tasks: dayTasks,
            dayOfWeek: selectedDay,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          setAiSortResult({
            tasks: data.tasks,
            explanation: data.explanation || '',
          });
          playChimeSound('complete');
        }
      } else {
        // Fallback heuristic sort: high priority first
        const sorted = [...dayTasks].sort((a, b) => {
          const score = { high: 3, medium: 2, low: 1 };
          return (score[b.priority] || 2) - (score[a.priority] || 2);
        });
        setAiSortResult({
          tasks: sorted,
          explanation: 'Đã sắp xếp ưu tiên các ca học trọng điểm và môn có độ khó cao lên đầu chuỗi tập trung.',
        });
        playChimeSound('complete');
      }
    } catch (err) {
      console.warn('Sort tasks error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplySortedTasks = () => {
    if (!aiSortResult) return;
    const otherTasks = tasks.filter((t) => t.dayOfWeek !== selectedDay);
    const nextTasks = [...otherTasks, ...aiSortResult.tasks];
    onUpdateTasks(nextTasks);

    const firstUnfinished = aiSortResult.tasks.find((t) => !t.completed);
    if (firstUnfinished) {
      setGlobalPomodoroState({
        activeTaskId: firstUnfinished.id,
        syncedDay: selectedDay,
      });
    }

    playChimeSound('complete');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
    setShowAiModal(false);
    setAiSortResult(null);
    setToastMessage('🧠 Đã sắp xếp lại thứ tự ca học tối ưu cho não bộ! Ca đầu tiên đã đồng bộ vào Pomodoro.');
    setTimeout(() => setToastMessage(''), 4500);
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
                    handleSyncDayWithPomodoro(d.day, d.label);
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-purple-600 text-white font-semibold shadow-2xs border-purple-600'
                      : isToday
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-transparent'
                  }`}
                  title={`Nhấn để xem và tự động kết nối chuỗi bài học ${d.label} vào Pomodoro`}
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

        {/* Daily Completion Header & Pomodoro Auto-Sync Bar */}
        {!isAllDays && totalTodayCount > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 px-4 my-3 rounded-2xl bg-gradient-to-r from-purple-50/90 via-rose-50/70 to-amber-50/70 border border-purple-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                🍅
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-900">
                    Tiến độ {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label}:
                  </span>
                  <span className="text-xs font-extrabold text-purple-800">
                    {completedTodayCount}/{totalTodayCount} nhiệm vụ
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> Auto-Sync: Xong tự qua bài tiếp
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Đã kết nối {totalTodayCount} bài vào Pomodoro. Khi học xong mỗi ca, hệ thống tự động đánh dấu hoàn thành và nhảy sang bài tiếp theo.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div className="w-24 md:w-32 h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-700 min-w-[32px] text-right font-mono">
                {completionPercent}%
              </span>

              <button
                type="button"
                onClick={() => {
                  handleSyncDayWithPomodoro(selectedDay);
                  window.dispatchEvent(
                    new CustomEvent('si_tu_2027_switch_phong_hoc_tab', { detail: { tab: 'pomodoro' } })
                  );
                  const pomodoroTabBtn = document.querySelector('[data-tab="pomodoro"]') as HTMLButtonElement | null;
                  if (pomodoroTabBtn) {
                    pomodoroTabBtn.click();
                  } else {
                    window.location.href = '/phong-hoc?tab=pomodoro';
                  }
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all hover:scale-102 active:scale-98"
                title="Mở Trạm Pomodoro với chuỗi bài học ngày này"
              >
                <span>Học Pomodoro (Auto-Advance)</span>
                <Timer className="w-3.5 h-3.5" />
              </button>
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
            filteredTasks.map((task, index) => {
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
                  draggable={!task.completed}
                  onDragStart={(e: any) => {
                    e.dataTransfer?.setData('text/plain', task.id);
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                    setDraggedTaskId(task.id);
                  }}
                  onDragOver={(e: any) => {
                    e.preventDefault?.();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                    if (draggedTaskId && draggedTaskId !== task.id) {
                      setDragOverTaskId(task.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverTaskId === task.id) {
                      setDragOverTaskId(null);
                    }
                  }}
                  onDrop={(e: any) => {
                    e.preventDefault?.();
                    const sourceId = e.dataTransfer?.getData('text/plain') || draggedTaskId;
                    if (sourceId && sourceId !== task.id) {
                      handleReorderTasks(sourceId, task.id);
                    }
                    setDraggedTaskId(null);
                    setDragOverTaskId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedTaskId(null);
                    setDragOverTaskId(null);
                  }}
                  onDoubleClick={() => handleSyncTaskWithTimer(task)}
                  className={`group relative p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    dragOverTaskId === task.id
                      ? 'border-purple-500 ring-2 ring-purple-400 bg-purple-50/70 shadow-md scale-[1.01]'
                      : ''
                  } ${
                    draggedTaskId === task.id ? 'opacity-40 border-dashed border-purple-400' : ''
                  } ${
                    task.completed
                      ? 'bg-stone-50/80 border-stone-200 text-stone-400'
                      : 'bg-white border-stone-200/90 hover:border-purple-300 shadow-2xs hover:shadow-xs'
                  }`}
                  title="Kéo thả biểu tượng ::: để đổi thứ tự, hoặc nhấn đúp để kết nối Pomodoro"
                >
                  {/* Top Task Row */}
                  <div className="flex items-start gap-2.5 sm:gap-3.5">
                    {/* Drag Handle & Up/Down Arrows */}
                    {!task.completed && (
                      <div className="flex flex-col items-center justify-center shrink-0 -ml-1 text-stone-300 group-hover:text-stone-500">
                        <div
                          className="p-1 cursor-grab active:cursor-grabbing hover:text-purple-600 rounded-lg hover:bg-stone-100 transition-colors"
                          title="Kéo thả để sắp xếp thứ tự ca học"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col -space-y-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTaskOrder(task.id, 'up');
                            }}
                            disabled={index === 0}
                            className="p-0.5 text-stone-300 hover:text-purple-600 disabled:opacity-20 disabled:hover:text-stone-300 rounded"
                            title="Di chuyển lên trên"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveTaskOrder(task.id, 'down');
                            }}
                            disabled={index === filteredTasks.length - 1}
                            className="p-0.5 text-stone-300 hover:text-purple-600 disabled:opacity-20 disabled:hover:text-stone-300 rounded"
                            title="Di chuyển xuống dưới"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

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

      {/* Gemini AI Multi-Feature Hub Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  ✨
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span>Gemini AI Cố Vấn Sĩ Tử 2K9</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      gemini-3.8-flash
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tạo ca học mục tiêu, tối ưu hóa thứ tự não bộ và chuẩn hóa phân loại môn thi 2027.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 AI Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl my-4">
              <button
                type="button"
                onClick={() => setAiTab('generate')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  aiTab === 'generate'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Tạo Ca Học</span>
              </button>

              <button
                type="button"
                onClick={() => setAiTab('sort')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  aiTab === 'sort'
                    ? 'bg-white text-amber-800 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>2. Sắp Xếp Thứ Tự</span>
              </button>

              <button
                type="button"
                onClick={() => setAiTab('classify')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  aiTab === 'classify'
                    ? 'bg-white text-sky-800 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>3. Phân Loại Môn</span>
              </button>
            </div>

            {/* TAB 1: GENERATE TASKS */}
            {aiTab === 'generate' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mục tiêu kỳ thi ưu tiên:
                    </label>
                    <select
                      value={targetAiExam}
                      onChange={(e) => setTargetAiExam(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
                    >
                      <option value="THPTQG">THPT Quốc Gia 2027</option>
                      <option value="V-ACT">ĐGNL ĐHQG-HCM (V-ACT)</option>
                      <option value="HSA">ĐGNL ĐHQG-HN (HSA)</option>
                      <option value="Tất cả">Toàn diện (THPTQG + ĐGNL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tổng thời gian tự học trong ngày: <span className="text-purple-700 font-bold">{studyHours} giờ</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={0.5}
                      value={studyHours}
                      onChange={(e) => setStudyHours(Number(e.target.value))}
                      className="w-full accent-purple-600 mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>1h (Nhẹ nhàng)</span>
                      <span>3h (Khuyến nghị)</span>
                      <span>6h (Cày thần tốc)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Môn cần ưu tiên cải thiện (Tick chọn để AI tập trung nhiều thời lượng hơn):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lí', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lí', 'Tư duy logic (ĐGNL)', 'Đọc hiểu ĐGNL'].map((sub) => {
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 flex-wrap">
                      <span>Ghi chú / Yêu cầu hoặc dán To-do list Markdown:</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                        ⚡ Hỗ trợ Markdown - [ ]
                      </span>
                    </label>
                    {customAiPrompt ? (
                      <button
                        type="button"
                        onClick={() => setCustomAiPrompt('')}
                        className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        Xóa nội dung
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setCustomAiPrompt(
`- [ ] toán
    - [ ] đề 1-2 (50’)
    - [ ] oxyz (50’)
        - [ ] toán oxyz thực tế
        - [ ] góc nhị diện
 ---
 - [ ] ANH
    - [ ] 15’ vocab + use now
    - [ ] vact Bài 1-2 (20 pass)
- [ ] 25’ tổng lại c.nghệ → gk1
- [ ] 25’ dạng a an the / past
- [ ] 50’ văn + code`
                          )
                        }
                        className="text-[11px] text-purple-600 hover:text-purple-800 font-medium underline transition-colors"
                      >
                        + Dán mẫu to-do checklist
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={4}
                    value={customAiPrompt}
                    onChange={(e) => setCustomAiPrompt(e.target.value)}
                    placeholder="Bạn có thể gõ yêu cầu tự do hoặc dán trực tiếp danh sách to-do / markdown checklist từ Notion, Notes, Keep...&#10;Ví dụ:&#10;- [ ] toán: đề 1-2 (50’)&#10;- [ ] ANH: 15’ vocab + vact Bài 1-2&#10;- [ ] 25’ tổng lại c.nghệ → gk1&#10;AI sẽ tự động bóc tách thành các ca học chuẩn kèm thời gian và subtasks!"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 font-mono leading-relaxed"
                  />

                  <div className="mt-1 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate pr-2">
                      {isMarkdownTodoList(customAiPrompt)
                        ? '✨ Đã nhận diện to-do Markdown! AI sẽ bóc tách môn, thời lượng (50\', 25\') và nhiệm vụ con.'
                        : 'Mẹo: Dán danh sách có đánh dấu - [ ] hoặc thời gian (50\', 25p) để AI bóc tách nhanh.'}
                    </span>
                    <span className="shrink-0">{customAiPrompt.length} ký tự</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isAiLoading}
                    onClick={handleGenerateAiTasks}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Gemini đang lên kế hoạch ca học...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Tạo Ca Học Cho {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Tasks Preview */}
                {generatedAiTasks.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <span>🎯 Đã tạo thành công {generatedAiTasks.length} ca học tối ưu:</span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-semibold">
                        Tổng: {generatedAiTasks.reduce((sum, t) => sum + t.durationMinutes, 0)} phút
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {generatedAiTasks.map((t, idx) => (
                        <div
                          key={t.id || idx}
                          className="p-2.5 bg-white rounded-xl border border-purple-200/80 text-xs flex flex-col gap-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-stone-900">
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px]">
                                {t.subject}
                              </span>
                              <span>{t.title}</span>
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-stone-600">
                              {t.durationMinutes}p ({t.timeSlot})
                            </span>
                          </div>
                          {t.notes && <p className="text-[11px] text-stone-500 italic">💡 {t.notes}</p>}
                          {t.subtasks && t.subtasks.length > 0 && (
                            <div className="text-[10px] text-purple-700 flex flex-wrap gap-1.5 mt-0.5">
                              {t.subtasks.map((st: any, sIdx: number) => (
                                <span key={sIdx} className="bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                                  ✓ {st.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {aiAdvice && (
                      <div className="text-xs text-purple-900 italic bg-white/70 p-2.5 rounded-xl border border-purple-200/60">
                        💬 <strong>Lời khuyên từ AI:</strong> {aiAdvice}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddGeneratedTasksToSchedule(generatedAiTasks)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Nạp {generatedAiTasks.length} ca học này vào lịch {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SMART SORT CHRONOBIOLOGY */}
            {aiTab === 'sort' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ArrowUpDown className="w-4 h-4 text-amber-600" />
                    <span>Khoa Học Não Bộ & Phân Bổ Nhịp Sinh Học Sĩ Tử 2K9:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    AI sẽ phân tích danh sách các ca học hiện có của ngày này, đưa môn đòi hỏi tư duy logic nặng (Toán, Lý, Hóa, Logic) vào thời điểm não tỉnh táo nhất, đồng thời xen kẽ với các môn ngôn ngữ / đọc hiểu (Văn, Anh, Sử) để tránh mệt mỏi bán cầu não.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-2xl p-3 bg-stone-50/60">
                  <div className="text-xs font-bold text-stone-800 mb-2 flex items-center justify-between">
                    <span>Danh sách hiện tại của {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label} ({tasks.filter((t) => t.dayOfWeek === selectedDay).length} ca):</span>
                  </div>

                  {tasks.filter((t) => t.dayOfWeek === selectedDay).length === 0 ? (
                    <div className="text-xs text-stone-500 py-4 text-center">
                      Chưa có ca học nào trong ngày này để sắp xếp. Vui lòng thêm bài học trước!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {tasks
                        .filter((t) => t.dayOfWeek === selectedDay)
                        .map((t, idx) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-stone-800">{t.subject}:</span>
                              <span className="text-stone-600 truncate max-w-[240px]">{t.title}</span>
                            </div>
                            <span className="text-[11px] font-mono text-stone-500">{t.durationMinutes}p</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isAiLoading || tasks.filter((t) => t.dayOfWeek === selectedDay).length < 2}
                    onClick={handleSortTasks}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Gemini đang phân tích nhịp sinh học não bộ...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Phân Tích & Sắp Xếp Thứ Tự Tối Ưu</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sort Result Preview */}
                {aiSortResult && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>🧠 Thứ tự tối ưu đã được phân tích:</span>
                    </div>

                    <p className="text-xs text-amber-900 italic bg-white/70 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                      💡 {aiSortResult.explanation}
                    </p>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {aiSortResult.tasks.map((t, idx) => (
                        <div
                          key={t.id || idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-200/80 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-stone-900">{t.subject}:</span>
                            <span className="text-stone-700 truncate max-w-[240px]">{t.title}</span>
                          </div>
                          <span className="text-[11px] font-mono text-purple-700 font-semibold">{t.timeSlot}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleApplySortedTasks}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Áp Dụng Thứ Tự Tối Ưu Này Vào Lịch Học</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CLASSIFY TASKS */}
            {aiTab === 'classify' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-sky-900">
                    <Bot className="w-4 h-4 text-sky-600" />
                    <span>Chuẩn Hóa Phân Loại Theo Chương Trình GDPT 2018 & Kỳ Thi 2027:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-sky-900/90">
                    AI sẽ kiểm tra các bài học, tự động chuẩn hóa tên môn, gắn nhãn kỳ thi (THPTQG 2027, V-ACT ĐHQG-HCM, HSA ĐHQG-HN) và thiết lập mức độ ưu tiên trọng điểm (high/medium/low).
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isAiLoading || tasks.filter((t) => t.dayOfWeek === selectedDay).length === 0}
                    onClick={handleClassifyTasks}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Gemini đang phân loại & chuẩn hóa môn học...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Phân Loại Ca Học {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.label}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Classify Result Preview */}
                {aiClassifyResult && (
                  <div className="mt-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                    <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <span>🏷️ Kết quả phân loại & chuẩn hóa:</span>
                    </div>

                    <p className="text-xs text-sky-900 italic bg-white/70 p-2.5 rounded-xl border border-sky-200/60 leading-relaxed">
                      📊 {aiClassifyResult.summary}
                    </p>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {aiClassifyResult.tasks.map((t, idx) => (
                        <div
                          key={t.id || idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-sky-200/80 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sky-900">{t.subject}</span>
                            <span className="text-stone-700 truncate max-w-[200px]">{t.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border">
                              {t.examTarget}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.priority === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : t.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {t.priority === 'high' ? 'Trọng điểm' : t.priority === 'medium' ? 'Củng cố' : 'Nhẹ'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleApplyClassifiedTasks}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Áp Dụng Chuẩn Hóa Phân Loại Này</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
