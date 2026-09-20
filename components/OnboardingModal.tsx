'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Target, GraduationCap, BookOpen, Trophy, Palette, ArrowRight, Check } from 'lucide-react';
import { PastelTheme, UserProfile } from '@/types/exam';
import { POPULAR_UNIVERSITIES, playChimeSound } from '@/lib/constants';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const THEMES: { id: PastelTheme; name: string; bg: string; ring: string; preview: string }[] = [
  { id: 'lavender', name: 'Tím Lavender Mộng Mơ', bg: 'bg-purple-100 text-purple-800', ring: 'ring-purple-400', preview: '#E9D5FF' },
  { id: 'rose', name: 'Hồng Pastel Ngọt Ngào', bg: 'bg-rose-100 text-rose-800', ring: 'ring-rose-400', preview: '#FFE4E6' },
  { id: 'sky', name: 'Xanh Da Trời Hy Vọng', bg: 'bg-sky-100 text-sky-800', ring: 'ring-sky-400', preview: '#BAE6FD' },
  { id: 'sage', name: 'Xanh Xô Thơm Tĩnh Tâm', bg: 'bg-emerald-100 text-emerald-800', ring: 'ring-emerald-400', preview: '#A7F3D0' },
  { id: 'peach', name: 'Cam Đào Ấm Áp', bg: 'bg-amber-100 text-amber-800', ring: 'ring-amber-400', preview: '#FDE68A' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSave,
}) => {
  const [studentName, setStudentName] = useState(initialProfile.studentName || 'Sĩ Tử 2K9');
  const [targetUniversity, setTargetUniversity] = useState(initialProfile.targetUniversity || '');
  const [universityShort, setUniversityShort] = useState(initialProfile.universityShort || '');
  const [targetMajor, setTargetMajor] = useState(initialProfile.targetMajor || '');
  const [targetScore, setTargetScore] = useState(initialProfile.targetScore || 'THPTQG: 27.5+ | V-ACT: 900+');
  const [motto, setMotto] = useState(initialProfile.motto || 'Chắc chắn đỗ Nguyện vọng 1 năm 2027!');
  const [themeColor, setThemeColor] = useState<PastelTheme>(initialProfile.themeColor || 'lavender');
  const [errorMsg, setErrorMsg] = useState('');

  // Suggestions based on chosen university
  const selectedUniObj = POPULAR_UNIVERSITIES.find((u) => u.name === targetUniversity || u.short === universityShort);

  const handleSelectUni = (uni: typeof POPULAR_UNIVERSITIES[0]) => {
    setTargetUniversity(uni.name);
    setUniversityShort(uni.short);
    if (!targetMajor && uni.majors.length > 0) {
      setTargetMajor(uni.majors[0]);
    }
    if (uni.targetScoreExample) {
      setTargetScore(uni.targetScoreExample);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUniversity.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập trường đại học bạn mơ ước!');
      return;
    }
    if (!targetMajor.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập ngành học bạn mong muốn!');
      return;
    }

    setErrorMsg('');
    const updated: UserProfile = {
      ...initialProfile,
      studentName: studentName.trim() || 'Sĩ Tử 2K9',
      targetUniversity: targetUniversity.trim(),
      universityShort: universityShort.trim() || targetUniversity.slice(0, 8),
      targetMajor: targetMajor.trim(),
      targetScore: targetScore.trim(),
      motto: motto.trim(),
      themeColor,
      isOnboarded: true,
    };

    onSave(updated);

    // Audio and confetti celebration
    playChimeSound('complete');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F472B6', '#38BDF8', '#4ADE80', '#FBBF24', '#C084FC'],
      });
    } catch {
      // ignore
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          id="onboarding-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-200/70 p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-rose-100 flex items-center justify-center text-2xl shadow-inner">
                🎯
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Sĩ Tử Thế Hệ 2K9</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900">
                  Xác Lập Nguyện Vọng & Mục Tiêu 2027
                </h2>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5">
                  Mục tiêu này sẽ được ghim trang trọng ngay đầu màn hình đếm ngược để tiếp lửa mỗi ngày!
                </p>
              </div>
            </div>
            {initialProfile.isOnboarded && (
              <button
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs md:text-sm rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Sĩ tử Name & Motto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Biệt danh / Tên của bạn
                </label>
                <div className="relative">
                  <input
                    id="input-student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ví dụ: Minh Nhật 2K9, Linh Chi..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Màu sắc pastel chủ đạo
                </label>
                <div className="flex items-center gap-2">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeColor(th.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        themeColor === th.id
                          ? 'ring-2 ring-offset-2 ring-stone-900 scale-105 shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: th.preview }}
                      title={th.name}
                    >
                      {themeColor === th.id && <Check className="w-4 h-4 text-stone-900" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* University Target - Required */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span>Trường Đại học Mơ Ước (Nguyện vọng 1) *</span>
                </label>
                <span className="text-[11px] text-stone-400">Chọn gợi ý hoặc gõ tên trường</span>
              </div>

              <input
                id="input-university"
                type="text"
                required
                value={targetUniversity}
                onChange={(e) => {
                  setTargetUniversity(e.target.value);
                  const found = POPULAR_UNIVERSITIES.find((u) => u.name.toLowerCase().includes(e.target.value.toLowerCase()));
                  if (found) setUniversityShort(found.short);
                }}
                placeholder="Ví dụ: Đại học Bách Khoa TP.HCM, ĐH Ngoại Thương, ĐH Y Dược..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all font-medium"
              />

              {/* Quick Popular University Pills */}
              <div className="mt-2.5">
                <div className="text-[11px] font-medium text-stone-500 mb-1.5">Gợi ý trường hàng đầu:</div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {POPULAR_UNIVERSITIES.slice(0, 10).map((uni) => (
                    <button
                      key={uni.short}
                      type="button"
                      onClick={() => handleSelectUni(uni)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        targetUniversity === uni.name
                          ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-xs'
                          : 'bg-stone-50/70 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <span>{uni.badge}</span>
                      <span>{uni.short}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Major Target - Required */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-rose-500" />
                  <span>Ngành Học Bạn Muốn Theo Đuổi *</span>
                </label>
                <span className="text-[11px] text-stone-400">Ngành nghề bạn đam mê</span>
              </div>

              <input
                id="input-major"
                type="text"
                required
                value={targetMajor}
                onChange={(e) => setTargetMajor(e.target.value)}
                placeholder="Ví dụ: Khoa học Máy tính & AI, Kinh doanh Quốc tế, Y Đa khoa, Logistics..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all font-medium"
              />

              {/* Major suggestions if university is recognized */}
              {selectedUniObj && selectedUniObj.majors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-stone-500 self-center">Ngành hot tại {selectedUniObj.short}:</span>
                  {selectedUniObj.majors.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTargetMajor(m)}
                      className={`px-2 py-0.5 rounded-md text-xs transition-colors border ${
                        targetMajor === m
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target Score & Motivational Motto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Điểm mục tiêu phấn đấu</span>
                </label>
                <input
                  id="input-target-score"
                  type="text"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  placeholder="Ví dụ: THPTQG: 28.0+ | V-ACT: 920+"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>Câu châm ngôn tiếp lửa</span>
                </label>
                <input
                  id="input-motto"
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ví dụ: Kỷ luật hôm nay, rực rỡ ngày mai!"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Live Preview of Pinned Goal */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>Xem trước Thẻ Ghim Nguyện Vọng</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
                    🏛️
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                        NV1 Ưu Tiên
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        {universityShort || 'TRƯỜNG'}
                      </span>
                    </div>
                    <div className="font-bold text-stone-900 text-sm truncate">
                      {targetUniversity || 'Chưa chọn trường'}
                    </div>
                    <div className="text-xs text-purple-700 font-medium truncate">
                      {targetMajor || 'Chưa chọn ngành'} • <span className="text-stone-500">{targetScore}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-stone-400">Châm ngôn</div>
                  <div className="text-xs italic text-stone-700 max-w-[200px] truncate">
                    &ldquo;{motto || 'Chinh phục 2027'}&rdquo;
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {initialProfile.isOnboarded && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                id="btn-save-onboarding"
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-black hover:to-stone-800 shadow-md hover:shadow-lg transition-all active:scale-98"
              >
                <span>Ghim Nguyện Vọng & Khởi Động 2027</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
