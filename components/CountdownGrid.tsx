'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Sparkles, ChevronDown, ChevronUp, AlertCircle, RefreshCw, PlusCircle, Trash2 } from 'lucide-react';
import { ExamEvent } from '@/types/exam';

interface CountdownGridProps {
  exams: ExamEvent[];
  onUpdateExams?: (exams: ExamEvent[]) => void;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetDateStr: string): TimeRemaining {
  const targetTime = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}

export const CountdownGrid: React.FC<CountdownGridProps> = ({ exams, onUpdateExams }) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [selectedSubRound, setSelectedSubRound] = useState<{ [examId: string]: string }>({
    'vact-2027': 'vact-2027-d1',
  });
  const [times, setTimes] = useState<{ [id: string]: TimeRemaining }>({});
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('2027-05-15T08:00');
  const [customDesc, setCustomDesc] = useState('');

  // Ticking effect every 1 second
  useEffect(() => {
    const updateAll = () => {
      const now = Date.now();
      setCurrentTime(now);
      const newTimes: { [id: string]: TimeRemaining } = {};
      exams.forEach((exam) => {
        // Calculate main exam time or active sub-round time
        const activeSubRoundId = selectedSubRound[exam.id];
        const activeSubRound = exam.subRounds?.find((s) => s.id === activeSubRoundId);
        const targetDate = activeSubRound ? activeSubRound.targetDate : exam.targetDate;

        newTimes[exam.id] = calculateTimeRemaining(targetDate);
        // Also calculate individual sub-rounds if available
        if (exam.subRounds) {
          exam.subRounds.forEach((sr) => {
            newTimes[sr.id] = calculateTimeRemaining(sr.targetDate);
          });
        }
      });
      setTimes(newTimes);
    };

    updateAll();
    const interval = setInterval(updateAll, 1000);
    return () => clearInterval(interval);
  }, [exams, selectedSubRound]);

  const visibleExams = selectedExamId === 'all' ? exams : exams.filter((e) => e.id === selectedExamId);

  const handleAddCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDate) return;

    const newExam: ExamEvent = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      shortName: customName.trim(),
      targetDate: new Date(customDate).toISOString(),
      description: customDesc.trim() || 'Mốc thi thử / kiểm tra cá nhân 2027',
      badge: 'Cá Nhân',
      colorScheme: {
        bg: 'bg-indigo-50/80',
        border: 'border-indigo-200/80',
        text: 'text-indigo-950',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-700',
        accent: '#6366f1',
        progressFill: 'from-indigo-300 to-violet-400',
      },
      tips: ['Lên kế hoạch ôn tập trước ngày thi ít nhất 2 tuần!'],
      isCustom: true,
    };

    if (onUpdateExams) {
      onUpdateExams([...exams, newExam]);
    }
    setCustomName('');
    setCustomDesc('');
    setShowAddCustomModal(false);
  };

  const handleDeleteCustomExam = (id: string) => {
    if (onUpdateExams) {
      onUpdateExams(exams.filter((e) => e.id !== id));
    }
  };

  return (
    <div id="countdown-section" className="mb-8">
      {/* Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>Đếm Ngược Các Kỳ Thi Trọng Đại 2027</span>
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Lịch thi chuẩn hóa THPTQG 2027, V-ACT, HSA (6 đợt), TSA (3 đợt), H-SCA Sư phạm TP.HCM & SPT Sư phạm Hà Nội (tham chiếu thực tế 2026)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/50 rounded-2xl self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedExamId('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedExamId === 'all'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Tất cả ({exams.length})
          </button>
          {exams.map((exam) => (
            <button
              key={exam.id}
              type="button"
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedExamId === exam.id
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {exam.badge}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAddCustomModal(true)}
            className="px-2.5 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-white/60 rounded-xl transition-colors flex items-center gap-1 text-xs"
            title="Thêm mốc thi thử hoặc kỳ thi cá nhân"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Thêm mốc</span>
          </button>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleExams.map((exam) => {
          const activeSubRoundId = selectedSubRound[exam.id];
          const activeSubRound = exam.subRounds?.find((s) => s.id === activeSubRoundId);
          const currentTargetDate = activeSubRound ? activeSubRound.targetDate : exam.targetDate;

          const t = times[exam.id] || {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isPast: false,
          };
          const isExpanded = expandedExamId === exam.id;
          const formattedDate = new Date(currentTargetDate).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // Journey progress: Assume 2K9 starts Senior year around Sep 1, 2026 until exam date
          const startDate = new Date('2026-09-01T00:00:00').getTime();
          const targetDate = new Date(currentTargetDate).getTime();
          const nowTs = currentTime || targetDate;
          const totalDuration = Math.max(1, targetDate - startDate);
          const elapsed = Math.max(0, nowTs - startDate);
          const percentPassed = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

          return (
            <motion.div
              key={exam.id}
              id={`exam-card-${exam.id}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-3xl border ${exam.colorScheme.border} ${exam.colorScheme.bg} p-5 flex flex-col justify-between shadow-xs transition-shadow hover:shadow-sm`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${exam.colorScheme.badgeBg} ${exam.colorScheme.badgeText}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{exam.badge}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{new Date(currentTargetDate).toLocaleDateString('vi-VN')}</span>
                    </span>
                    {exam.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomExam(exam.id)}
                        className="p-1 text-stone-400 hover:text-red-500 rounded-md transition-colors"
                        title="Xóa mốc thi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className={`text-base md:text-lg font-bold ${exam.colorScheme.text} leading-snug line-clamp-2`}>
                  {exam.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                  {exam.description}
                </p>

                {/* Sub-rounds Switcher (e.g. V-ACT, HSA, TSA, H-SCA, SPT) */}
                {exam.subRounds && exam.subRounds.length > 0 && (
                  <div className="mt-3">
                    <div className="p-1 bg-white/85 backdrop-blur-xs rounded-2xl border border-stone-200/80 flex flex-wrap items-center gap-1">
                      {exam.subRounds.map((sr) => {
                        const isRoundActive = (selectedSubRound[exam.id] || exam.subRounds![0].id) === sr.id;
                        const srTime = times[sr.id];
                        return (
                          <button
                            key={sr.id}
                            type="button"
                            onClick={() => setSelectedSubRound((prev) => ({ ...prev, [exam.id]: sr.id }))}
                            className={`flex-1 min-w-[70px] py-1 px-2 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1 ${
                              isRoundActive
                                ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                            }`}
                          >
                            <span>{sr.shortName}</span>
                            {srTime && (
                              <span className={`text-[10px] px-1 py-0.2 rounded-md font-mono font-bold ${
                                isRoundActive ? 'bg-stone-700 text-white' : 'bg-stone-200/80 text-stone-600'
                              }`}>
                                {srTime.days}d
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active sub-round description & 2026 reference date */}
                    {activeSubRound && (
                      <div className="mt-1.5 px-2 text-[11px] text-stone-500 flex items-center justify-between gap-1">
                        <span className="truncate">{activeSubRound.description}</span>
                        {activeSubRound.reference2026 && (
                          <span className="font-mono text-[10px] bg-stone-100 border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded-md shrink-0">
                            {activeSubRound.reference2026}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Countdown Tickers (Days, Hours, Mins, Secs) */}
              <div className="my-4 pt-3 pb-2 border-y border-stone-200/60">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {/* Days */}
                  <div className="p-2 rounded-2xl bg-white/90 border border-stone-200/80 shadow-2xs">
                    <div className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight font-mono">
                      {t.days}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
                      Ngày
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="p-2 rounded-2xl bg-white/90 border border-stone-200/80 shadow-2xs">
                    <div className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight font-mono">
                      {String(t.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
                      Giờ
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="p-2 rounded-2xl bg-white/90 border border-stone-200/80 shadow-2xs">
                    <div className="text-xl md:text-2xl font-extrabold text-stone-900 tracking-tight font-mono">
                      {String(t.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
                      Phút
                    </div>
                  </div>

                  {/* Seconds */}
                  <div className="p-2 rounded-2xl bg-white/90 border border-stone-200/80 shadow-2xs relative overflow-hidden">
                    <div className="text-xl md:text-2xl font-extrabold text-rose-600 tracking-tight font-mono">
                      {String(t.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-rose-400 tracking-wider mt-0.5">
                      Giây
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-400/40 animate-pulse" />
                  </div>
                </div>

                {/* Progress bar of preparation journey */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>Hành trình ôn luyện 2K9</span>
                    <span className="font-semibold text-stone-700">{percentPassed}% chặng đường</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${exam.colorScheme.progressFill} transition-all duration-500`}
                      style={{ width: `${percentPassed}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer & Tips Toggle */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500 truncate">
                    {formattedDate}
                  </span>
                  {exam.tips && exam.tips.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 py-1 px-2 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      <span>{isExpanded ? 'Ẩn mẹo' : 'Mẹo thi'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Expandable Tips Panel */}
                {isExpanded && exam.tips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-stone-200/70 text-xs text-stone-700 space-y-1.5"
                  >
                    <div className="font-semibold text-stone-900 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Chiến thuật ghi điểm:</span>
                    </div>
                    {exam.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 pl-1">
                        <span className="text-stone-400 select-none">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Custom Milestone Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Thêm Mốc Thi / Sự Kiện Cá Nhân</h3>
            <p className="text-xs text-stone-500 mb-4">
              Tạo đồng hồ đếm ngược cho kỳ thi thử ở trường, kỳ thi IELTS, hoặc mốc nộp hồ sơ.
            </p>

            <form onSubmit={handleAddCustomExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tên sự kiện / Mốc thi *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ví dụ: Thi thử ĐGNL lần 1, Thi kết thúc HK1..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ngày và giờ diễn ra *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ghi chú mục tiêu
                </label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Ví dụ: Mục tiêu đạt từ 850 điểm trở lên"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-stone-900 hover:bg-black shadow-xs"
                >
                  Tạo đếm ngược
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
