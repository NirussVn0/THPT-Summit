'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, ChevronRight, ChevronLeft, Quote, Sparkles, Copy, Check } from 'lucide-react';
import { MOTIVATION_QUOTES } from '@/lib/constants';

const EXAM_TIPS = [
  {
    title: 'Quy tắc 80/20 trong đề thi GDPT mới 2027',
    content: 'Dạng trắc nghiệm Đúng/Sai môn Toán, Lý, Hóa gồm 4 ý (a, b, c, d). Làm đúng 1 ý được 0.1đ, đúng 2 ý được 0.25đ, đúng 3 ý được 0.5đ và đúng cả 4 ý mới được trọn 1.0đ. Đừng đoán mò bừa bãi!',
    tag: 'THPTQG 2027',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    title: 'Mẹo phân bổ thời gian V-ACT ĐHQG TP.HCM (Đợt 1 & 2)',
    content: '120 câu / 150 phút. Đợt 1 diễn ra đầu tháng 4 (04/04/2027), Đợt 2 cuối tháng 5 (23/05/2027). Hãy dùng Đợt 1 để làm quen không khí phòng thi và đặt mục tiêu bứt phá điểm số tối đa ở Đợt 2.',
    tag: 'V-ACT Đợt 1 & 2',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    title: 'Kinh nghiệm thi HSA máy tính ĐHQG Hà Nội (6 đợt thi)',
    content: 'Kỳ thi HSA gồm 6 đợt từ đầu tháng 3 đến cuối tháng 5. Khi làm câu hỏi điền số trực tiếp trên máy tính, chú ý dấu âm và dấu chấm số thập phân theo đúng quy chuẩn hướng dẫn.',
    tag: 'HSA (6 Đợt)',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Bí quyết bứt phá TSA ĐH Bách Khoa Hà Nội (3 đợt sớm)',
    content: 'TSA Đợt 1 khởi động rất sớm từ cuối tháng 1 (23/01/2027), tiếp theo là giữa tháng 3 và giữa tháng 5. Bài thi gồm Tư duy Toán học, Đọc hiểu và Khoa học/Giải quyết vấn đề, tập trung vào tư duy phân tích thực tế.',
    tag: 'TSA Bách Khoa',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    title: 'Kỳ thi ĐGNL chuyên biệt H-SCA Sư phạm TP.HCM & SPT Sư phạm Hà Nội',
    content: 'H-SCA (HCMUE) tổ chức 3 đợt (cuối T3, đầu T5, cuối T5). SPT (HNUE) tổ chức 2 đợt cuối tháng 5. Đề thi bám sát chương trình GDPT 2018 theo từng môn chuyên biệt để nhân hệ số môn chính.',
    tag: 'H-SCA & SPT',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    title: 'Ngữ Văn GDPT 2018: Tuyệt đối không học tủ SGK',
    content: 'Tất cả các ngữ liệu trong đề thi tốt nghiệp đều là văn bản ngoài sách giáo khoa. Hãy rèn luyện kỹ năng phân tích đặc trưng thể loại (thơ, truyện ngắn, nghị luận) thay vì học thuộc lòng văn mẫu.',
    tag: 'Bí Kíp Ngữ Văn',
    color: 'bg-stone-50 text-stone-700 border-stone-200',
  },
];

export const DailyTipsWidget: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentTip = EXAM_TIPS[tipIndex];
  const currentQuote = MOTIVATION_QUOTES[quoteIndex];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % EXAM_TIPS.length);
  };

  const handlePrevTip = () => {
    setTipIndex((prev) => (prev - 1 + EXAM_TIPS.length) % EXAM_TIPS.length);
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
  };

  const handleCopyQuote = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="daily-tips-widget" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Tip Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Chiến Thuật Phòng Thi 2K9</h3>
                <p className="text-[11px] text-stone-500">Mẹo làm bài & định dạng đề thi mới</p>
              </div>
            </div>

            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${currentTip.color}`}>
              {currentTip.tag}
            </span>
          </div>

          <div className="my-2 min-h-[90px]">
            <h4 className="text-sm font-bold text-stone-800 mb-1.5">{currentTip.title}</h4>
            <p className="text-xs text-stone-600 leading-relaxed">{currentTip.content}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
          <span className="text-[11px] text-stone-400 font-mono">
            {tipIndex + 1} / {EXAM_TIPS.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevTip}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextTip}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Motivation Quote Card */}
      <div className="bg-gradient-to-br from-purple-50/80 via-white to-pink-50/50 rounded-3xl border border-purple-200/60 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                <Quote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Câu Nói Tiếp Lửa Mỗi Ngày</h3>
                <p className="text-[11px] text-stone-500">Giữ vững niềm tin trên chặng đường 2027</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyQuote}
              className="p-1.5 rounded-xl text-stone-400 hover:text-purple-700 hover:bg-white transition-colors"
              title="Sao chép câu nói"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="my-2 min-h-[90px] flex flex-col justify-center">
            <blockquote className="text-xs md:text-sm font-medium text-stone-800 italic leading-relaxed">
              &ldquo;{currentQuote.quote}&rdquo;
            </blockquote>
            <div className="text-right text-xs font-semibold text-purple-700 mt-2">
              — {currentQuote.author}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-purple-100/80 mt-2">
          <span className="text-[11px] text-stone-400 font-mono">
            {quoteIndex + 1} / {MOTIVATION_QUOTES.length}
          </span>

          <button
            type="button"
            onClick={handleNextQuote}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 py-1 px-2 rounded-lg hover:bg-purple-100/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đổi câu khác</span>
          </button>
        </div>
      </div>
    </div>
  );
};
