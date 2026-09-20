'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Radio,
  Flame,
  Heart,
  Sparkles,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import { playChimeSound } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface LiveStudyRoomWidgetProps {
  isUserStudying: boolean;
  onToggleUserStudying: () => void;
  liveCount: number;
}

const POPULAR_SUBJECTS = [
  { name: 'Toán & Định lượng', percent: 36, color: 'bg-rose-500', lightColor: 'bg-rose-100 text-rose-800' },
  { name: 'Logic & ĐGNL (V-ACT/HSA)', percent: 28, color: 'bg-sky-500', lightColor: 'bg-sky-100 text-sky-800' },
  { name: 'Tiếng Anh', percent: 19, color: 'bg-amber-500', lightColor: 'bg-amber-100 text-amber-800' },
  { name: 'Ngữ Văn & Khoa Học', percent: 17, color: 'bg-emerald-500', lightColor: 'bg-emerald-100 text-emerald-800' },
];

const INITIAL_FEED = [
  { id: '1', text: 'Bạn Hoàng (Hà Nội) vừa hoàn thành 1 chu kỳ Pomodoro Toán!', time: '1 phút trước', tag: 'Pomodoro' },
  { id: '2', text: 'Sĩ tử NV1 Ngoại Thương vừa vào phòng cày ĐGNL V-ACT!', time: '2 phút trước', tag: 'V-ACT' },
  { id: '3', text: 'Bạn Phương (TP.HCM) vừa đánh dấu xong 3 mục tiêu ôn tập.', time: '4 phút trước', tag: 'Kỷ luật' },
  { id: '4', text: 'Sĩ tử 2K9 (Đà Nẵng) gửi 50 tim tiếp lửa cho cả phòng thi!', time: '6 phút trước', tag: 'Tiếp sức' },
];

export const LiveStudyRoomWidget: React.FC<LiveStudyRoomWidgetProps> = ({
  isUserStudying,
  onToggleUserStudying,
  liveCount,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Toán 12 & Giải tích');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [cheerCount, setCheerCount] = useState(12840);
  const [hasCheered, setHasCheered] = useState(false);
  const [feed, setFeed] = useState(INITIAL_FEED);

  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for user's active session
  useEffect(() => {
    if (isUserStudying) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    }
    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    };
  }, [isUserStudying]);

  // Occasional new activities in study feed
  useEffect(() => {
    const activities = [
      'Một bạn sĩ tử vừa hoàn thành bài test 10 câu trắc nghiệm Đúng/Sai!',
      'Sĩ tử NV1 Bách Khoa (HUST) vừa bắt đầu phiên ôn Tư duy Logic!',
      'Bạn Khánh (Cần Thơ) vừa bật chuông nhắc ôn Tiếng Anh 20h30.',
      'Sĩ tử 2K9 vừa đạt chuỗi 7 ngày học tập liên tiếp 🔥',
      'Một bạn vừa tham gia phòng học cùng 1,400+ sĩ tử khác!',
    ];

    const interval = setInterval(() => {
      const randomText = activities[Math.floor(Math.random() * activities.length)];
      setFeed((prev) => [
        {
          id: `feed-${Date.now()}`,
          text: randomText,
          time: 'Vừa xong',
          tag: 'Đồng đội',
        },
        ...prev.slice(0, 4),
      ]);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  const handleCheer = () => {
    setCheerCount((c) => c + 1);
    setHasCheered(true);
    playChimeSound('complete');

    try {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#EC4899', '#F43F5E', '#F59E0B'],
      });
    } catch {}

    setTimeout(() => setHasCheered(false), 2000);
  };

  const formatSessionTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="live-study-room-section"
      className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 md:p-6 mb-8 transition-all relative overflow-hidden"
    >
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      {/* Header with Live Status & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-bold text-stone-900">
                Phòng Tự Học Trực Tuyến 2K9
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Không gian đồng hành ôn thi THPTQG, V-ACT & HSA cùng sĩ tử toàn quốc
            </p>
          </div>
        </div>

        {/* Live Count Display & Quick Join Button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="px-3.5 py-2 rounded-2xl bg-stone-50 border border-stone-200/80 text-right">
            <div className="text-xs text-stone-500 flex items-center justify-end gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đang cùng học</span>
            </div>
            <div className="text-lg md:text-xl font-extrabold text-stone-900 font-mono tracking-tight text-emerald-700">
              {liveCount.toLocaleString('vi-VN')} <span className="text-xs font-normal text-stone-500">sĩ tử</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleUserStudying}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
              isUserStudying
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isUserStudying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Rời bàn học</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Vào bàn học ngay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User's Active Desk Banner when studying */}
      <AnimatePresence>
        {isUserStudying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-emerald-700 font-bold flex items-center justify-center shadow-xs text-sm">
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-950">Bạn đang có mặt trong phòng tự học!</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-medium text-emerald-800 border border-emerald-200">
                      Môn: {selectedSubject}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Kỷ luật tạo nên thành công. Tắt thông báo điện thoại để tập trung tối đa nhé!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-mono font-bold text-emerald-800 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formatSessionTime(sessionSeconds)}</span>
                </div>

                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-white border border-emerald-200 rounded-xl text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
                >
                  <option value="Toán 12 & Giải tích">Toán 12 & Giải tích</option>
                  <option value="ĐGNL V-ACT (ĐHQG TP.HCM)">ĐGNL V-ACT (ĐHQG TP.HCM)</option>
                  <option value="ĐGNL HSA (ĐHQG Hà Nội)">ĐGNL HSA (ĐHQG Hà Nội)</option>
                  <option value="ĐGTD TSA (ĐH Bách Khoa)">ĐGTD TSA (ĐH Bách Khoa)</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Ngữ Văn">Ngữ Văn</option>
                  <option value="Vật Lí">Vật Lí</option>
                  <option value="Hóa Học">Hóa Học</option>
                  <option value="Sinh / Sử / Địa / GDCD">Sinh / Sử / Địa / GDCD</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: 3 Columns of Live Statistics & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        {/* Column 1: Subject Breakdown */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-stone-800">Môn học đang ôn nhiều nhất</span>
            </div>
            <span className="text-[10px] text-stone-400">Thời gian thực</span>
          </div>

          <div className="space-y-3">
            {POPULAR_SUBJECTS.map((sub) => {
              const estimatedStudents = Math.round((liveCount * sub.percent) / 100);
              return (
                <div key={sub.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium truncate">{sub.name}</span>
                    <span className="text-stone-500 text-[11px] font-mono shrink-0 ml-1">
                      {sub.percent}% ({estimatedStudents.toLocaleString('vi-VN')})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${sub.color}`}
                      style={{ width: `${sub.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Regional Distribution */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-stone-800">Khu vực sĩ tử đang học</span>
              </div>
              <span className="text-[10px] text-stone-400">Toàn quốc</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="font-medium text-stone-800">Miền Nam & TP.HCM</span>
                </div>
                <span className="font-mono text-stone-600 font-semibold">44%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-stone-800">Miền Bắc & Hà Nội</span>
                </div>
                <span className="font-mono text-stone-600 font-semibold">36%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium text-stone-800">Miền Trung & Tây Nguyên</span>
                </div>
                <span className="font-mono text-stone-600 font-semibold">20%</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-stone-500 italic text-center">
            Hàng ngàn sĩ tử khắp 63 tỉnh thành đang cùng bạn nỗ lực từng giây!
          </div>
        </div>

        {/* Column 3: Live Cheer & Activity Stream */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/50 via-white to-purple-50/50 border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-stone-800">Tiếp sức đồng đội 2027</span>
              </div>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md font-semibold">
                {cheerCount.toLocaleString('vi-VN')} 🔥
              </span>
            </div>

            <div className="space-y-2 my-2">
              {feed.slice(0, 3).map((item) => (
                <div key={item.id} className="p-2 bg-white/90 rounded-xl border border-stone-100 text-[11px] shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-0.5">
                    <span className="font-semibold text-purple-700">{item.tag}</span>
                    <span>{item.time}</span>
                  </div>
                  <p className="text-stone-700 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheer}
            className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 ${
              hasCheered
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 fill-rose-500 text-rose-500 ${hasCheered ? 'scale-125' : ''} transition-transform`} />
            <span>Bắn tim tiếp sức đồng đội (+1 🔥)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
