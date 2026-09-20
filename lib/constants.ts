import { ExamEvent, ReminderSetting, StudyTask, UserProfile } from '@/types/exam';

export const POPULAR_UNIVERSITIES = [
  {
    name: 'Đại học Bách Khoa - ĐHQG TP.HCM',
    short: 'HCMUT',
    badge: '🏛️',
    majors: ['Khoa học Máy tính & AI', 'Kỹ thuật Phần mềm', 'Kỹ thuật Cơ điện tử', 'Logistics & Quản lý Chuỗi cung ứng', 'Kỹ thuật Ô tô'],
    popularExams: ['THPTQG', 'V-ACT'],
    targetScoreExample: 'V-ACT: 880+ | THPTQG: 26.5+',
  },
  {
    name: 'Đại học Ngoại Thương (FTU)',
    short: 'FTU',
    badge: '🌐',
    majors: ['Kinh tế Đối ngoại', 'Kinh doanh Quốc tế', 'Tài chính Ngân hàng', 'Marketing Số', 'Luật Thương mại Quốc tế'],
    popularExams: ['THPTQG', 'V-ACT', 'HSA'],
    targetScoreExample: 'THPTQG: 28.0+ | HSA: 110+',
  },
  {
    name: 'Đại học Kinh Tế TP.HCM (UEH)',
    short: 'UEH',
    badge: '📈',
    majors: ['Kinh doanh Quốc tế', 'Logistics & Quản lý Chuỗi cung ứng', 'Công nghệ Tài chính (FinTech)', 'Marketing', 'Kiểm toán'],
    popularExams: ['THPTQG', 'V-ACT'],
    targetScoreExample: 'V-ACT: 850+ | THPTQG: 26.5+',
  },
  {
    name: 'Đại học Kinh Tế Quốc Dân (NEU)',
    short: 'NEU',
    badge: '💼',
    majors: ['Kinh tế Quốc tế', 'Thương mại Điện tử', 'Quản trị Kinh doanh', 'Phân tích Dữ liệu Kinh doanh', 'Tài chính - Ngân hàng'],
    popularExams: ['THPTQG', 'HSA'],
    targetScoreExample: 'HSA: 105+ | THPTQG: 27.5+',
  },
  {
    name: 'Đại học Bách Khoa Hà Nội (HUST)',
    short: 'HUST',
    badge: '⚙️',
    majors: ['Khoa học Máy tính (IT1)', 'Kỹ thuật Máy tính (IT2)', 'Khoa học Dữ liệu & AI', 'Điều khiển & Tự động hóa', 'Vi mạch Bán dẫn'],
    popularExams: ['TSA', 'THPTQG', 'HSA'],
    targetScoreExample: 'TSA: 75+ | THPTQG: 27.0+',
  },
  {
    name: 'Đại học Y Dược TP.HCM (UMP)',
    short: 'UMP',
    badge: '🩺',
    majors: ['Y Đa khoa', 'Răng Hàm Mặt', 'Dược học', 'Kỹ thuật Xét nghiệm Y học', 'Y học Cổ truyền'],
    popularExams: ['THPTQG', 'V-ACT'],
    targetScoreExample: 'THPTQG: 27.8+ (B00)',
  },
  {
    name: 'Đại học Y Hà Nội (HMU)',
    short: 'HMU',
    badge: '🏥',
    majors: ['Y Đa khoa', 'Răng Hàm Mặt', 'Y học Cổ truyền', 'Điều dưỡng', 'Dinh dưỡng'],
    popularExams: ['THPTQG'],
    targetScoreExample: 'THPTQG: 28.0+ (B00)',
  },
  {
    name: 'Đại học Công Nghệ - ĐHQG Hà Nội (UET)',
    short: 'UET',
    badge: '💻',
    majors: ['Công nghệ Thông tin', 'Trí tuệ Nhân tạo', 'Thiết kế Vi mạch', 'Robot & Kỹ thuật Điều khiển', 'Kỹ thuật Hàng không'],
    popularExams: ['HSA', 'THPTQG'],
    targetScoreExample: 'HSA: 110+ | THPTQG: 27.5+',
  },
  {
    name: 'Đại học Khoa Học Tự Nhiên - ĐHQG TP.HCM (HCMUS)',
    short: 'HCMUS',
    badge: '🔬',
    majors: ['Khoa học Máy tính', 'Trí tuệ Nhân tạo', 'Khoa học Dữ liệu', 'Hóa học', 'Công nghệ Sinh học'],
    popularExams: ['V-ACT', 'THPTQG'],
    targetScoreExample: 'V-ACT: 900+ | THPTQG: 26.5+',
  },
  {
    name: 'Học Viện Công Nghệ Bưu Chính Viễn Thông (PTIT)',
    short: 'PTIT',
    badge: '📡',
    majors: ['Công nghệ Thông tin', 'An toàn Thông tin', 'Khoa học Dữ liệu', 'Công nghệ Đa phương tiện', 'Kỹ thuật Điện tử Viễn thông'],
    popularExams: ['THPTQG', 'HSA'],
    targetScoreExample: 'THPTQG: 26.0+ | HSA: 95+',
  },
  {
    name: 'Đại học Quốc Tế - ĐHQG TP.HCM (IU)',
    short: 'IU',
    badge: '🌏',
    majors: ['Quản trị Kinh doanh', 'Logistics', 'Kỹ thuật Y Sinh', 'Khoa học Dữ liệu', 'Ngôn ngữ Anh'],
    popularExams: ['V-ACT', 'THPTQG'],
    targetScoreExample: 'V-ACT: 800+ | THPTQG: 24.5+',
  },
  {
    name: 'Đại học Luật TP.HCM / Hà Nội',
    short: 'ULAW',
    badge: '⚖️',
    majors: ['Luật Thương mại Quốc tế', 'Luật Dân sự', 'Luật Kinh doanh', 'Luật Quốc tế'],
    popularExams: ['THPTQG', 'HSA', 'V-ACT'],
    targetScoreExample: 'THPTQG: 26.5+',
  },
  {
    name: 'Đại học Sư Phạm TP.HCM / Hà Nội',
    short: 'HNUE/HCMUE',
    badge: '📚',
    majors: ['Sư phạm Toán', 'Sư phạm Tiếng Anh', 'Sư phạm Ngữ văn', 'Tâm lý học Giáo dục'],
    popularExams: ['THPTQG', 'ĐGNL Sư phạm'],
    targetScoreExample: 'THPTQG: 27.0+',
  },
];

export const DEFAULT_EXAMS: ExamEvent[] = [
  {
    id: 'thptqg-2027',
    name: 'Kỳ thi Tốt nghiệp THPT Quốc gia 2027',
    shortName: 'THPTQG 2027',
    // Expected date for 2027 graduation exam (late June 2027)
    targetDate: '2027-06-25T07:30:00',
    description: 'Kỳ thi trọng đại kết thúc 12 năm đèn sách, quyết định xét tốt nghiệp và xét tuyển đại học theo chương trình GDPT 2018.',
    badge: 'Kỳ thi Quốc gia',
    colorScheme: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/80',
      text: 'text-rose-950',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-700',
      accent: '#f43f5e',
      progressFill: 'from-rose-300 to-pink-400',
    },
    tips: [
      'Nắm chắc 7 điểm đầu tiên trong đề thi mẫu GDPT 2018 trước khi đào sâu câu vận dụng cao.',
      'Môn Toán mới có thêm dạng trắc nghiệm đúng/sai và điền kết quả ngắn, hãy luyện kỹ kỹ năng bấm máy và lập luận nhanh.',
      'Ngữ Văn không dùng văn bản trong SGK: rèn luyện kỹ năng đọc hiểu văn bản mở và viết nghị luận xã hội súc tích.',
    ],
    totalQuestionCount: 4, // 2 obligatory + 2 optional
    durationMinutes: 450,
  },
  {
    id: 'vact-2027',
    name: 'Đánh giá Năng lực ĐHQG TP.HCM 2027 (Đợt 1 & Đợt 2)',
    shortName: 'V-ACT 2027 (ĐHQG-HCM)',
    // Round 1 default targetDate
    targetDate: '2027-03-28T07:30:00',
    description: 'Kỳ thi ĐGNL lớn nhất miền Nam gồm 2 đợt thi (Đợt 1: 28/03/2027 & Đợt 2: 30/05/2027) với hơn 100 trường ĐH xét tuyển. Thang điểm 1200.',
    badge: 'V-ACT (Đợt 1 & 2)',
    colorScheme: {
      bg: 'bg-sky-50/80',
      border: 'border-sky-200/80',
      text: 'text-sky-950',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-700',
      accent: '#0284c7',
      progressFill: 'from-sky-300 to-blue-400',
    },
    tips: [
      '120 câu trong 150 phút: Trung bình 1 phút 15 giây cho mỗi câu, tuyệt đối không sa đà vào một câu quá 2 phút.',
      'Hai đợt thi: Đa số các trường ĐH xét điểm đợt cao nhất, hãy tận dụng Đợt 1 để thử sức và bứt phá ở Đợt 2.',
      'Phần Tư duy Logic & Phân tích số liệu là phần phân loại thí sinh cao nhất, hãy luyện vẽ sơ đồ Venn và bảng logic.',
      'Đọc hiểu Tiếng Việt và Tiếng Anh chiếm trọng số lớn, chú ý đọc quét (skimming/scanning) từ khóa.',
    ],
    totalQuestionCount: 120,
    durationMinutes: 150,
    subRounds: [
      {
        id: 'vact-2027-d1',
        name: 'V-ACT Đợt 1',
        shortName: 'Đợt 1',
        targetDate: '2027-03-28T07:30:00',
        description: 'Đợt 1 diễn ra cuối tháng 3/2027 tại hơn 20 tỉnh thành.',
      },
      {
        id: 'vact-2027-d2',
        name: 'V-ACT Đợt 2',
        shortName: 'Đợt 2',
        targetDate: '2027-05-30T07:30:00',
        description: 'Đợt 2 diễn ra cuối tháng 5/2027 trước kỳ thi THPTQG.',
      },
    ],
  },
  {
    id: 'hsa-2027',
    name: 'Đánh giá Năng lực ĐHQG Hà Nội 2027 (Đợt thi sớm)',
    shortName: 'HSA 2027 (ĐHQG-HN)',
    // Early HSA waves typically start mid-March 2027
    targetDate: '2027-03-13T07:30:00',
    description: 'Kỳ thi HSA máy tính chuẩn hóa với 3 phần: Tư duy định lượng, Tư duy định tính và Khoa học. Thang điểm 150.',
    badge: 'HSA 2027',
    colorScheme: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      text: 'text-emerald-950',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
      accent: '#059669',
      progressFill: 'from-emerald-300 to-teal-400',
    },
    tips: [
      'Thi trên máy tính: Làm quen với giao diện trắc nghiệm máy và câu hỏi điền số trực tiếp.',
      'Phần Tư duy định lượng (Toán học): Chú ý các câu hỏi ứng dụng thực tế và xác suất thống kê.',
      'Chuẩn bị tâm lý vững vàng vì thi trên máy thời gian đếm ngược trực tiếp trên màn hình.',
    ],
    totalQuestionCount: 150,
    durationMinutes: 195,
  },
  {
    id: 'tsa-2027',
    name: 'Đánh giá Tư duy ĐH Bách Khoa Hà Nội 2027',
    shortName: 'TSA 2027 (HUST)',
    // TSA rounds start early 2027
    targetDate: '2027-01-23T07:30:00',
    description: 'Kỳ thi ĐGTD nổi tiếng dành cho khối kỹ thuật, công nghệ và kinh tế. Thang điểm 100.',
    badge: 'TSA Đợt 1',
    colorScheme: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      text: 'text-amber-950',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      accent: '#d97706',
      progressFill: 'from-amber-300 to-orange-400',
    },
    tips: [
      '3 phần thi: Tư duy Toán học, Tư duy Đọc hiểu và Tư duy Khoa học/Giải quyết vấn đề.',
      'Không yêu cầu học vẹt kiến thức mà đòi hỏi khả năng suy luận, đọc hiểu dữ liệu thí nghiệm khoa học.',
    ],
    totalQuestionCount: 100,
    durationMinutes: 150,
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  studentName: 'Sĩ Tử 2K9',
  targetUniversity: 'Đại học Bách Khoa - ĐHQG TP.HCM',
  universityShort: 'HCMUT',
  targetMajor: 'Khoa học Máy tính & Trí tuệ Nhân tạo',
  targetScore: 'V-ACT: 900+ | THPTQG: 27.5+',
  motto: 'Mỗi giờ kỷ luật hôm nay là một bước chạm tay vào giảng đường mơ ước!',
  examCombinations: ['A00', 'A01', 'V-ACT 2027'],
  themeColor: 'lavender',
  isOnboarded: false,
};

export const DEFAULT_STUDY_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Chuyên đề Hàm số & Cực trị (Dạng trắc nghiệm GDPT mới)',
    subject: 'Toán',
    dayOfWeek: 1, // Thứ 2
    timeSlot: '19:30 - 21:00',
    durationMinutes: 90,
    completed: false,
    priority: 'high',
    examTarget: 'THPTQG',
    notes: 'Luyện 25 câu trắc nghiệm đúng sai và 5 câu trả lời ngắn',
  },
  {
    id: 'task-2',
    title: 'Giải đề Tư duy Logic & Bảng suy luận ĐGNL V-ACT',
    subject: 'Tư Duy Logic (ĐGNL)',
    dayOfWeek: 2, // Thứ 3
    timeSlot: '20:00 - 21:30',
    durationMinutes: 90,
    completed: true,
    priority: 'high',
    examTarget: 'V-ACT',
    notes: 'Tập trung dạng đề sắp xếp vị trí và quan hệ logic',
  },
  {
    id: 'task-3',
    title: 'Đọc hiểu văn bản hiện đại & Kỹ năng viết đoạn NLXH 200 chữ',
    subject: 'Ngữ Văn',
    dayOfWeek: 3, // Thứ 4
    timeSlot: '19:30 - 21:00',
    durationMinutes: 90,
    completed: false,
    priority: 'medium',
    examTarget: 'THPTQG',
    notes: 'Chủ đề: Bản lĩnh và tư duy phản biện của thế hệ trẻ',
  },
  {
    id: 'task-4',
    title: 'Ôn tập Dao động cơ & Sóng cơ (Câu hỏi thực tế đời sống)',
    subject: 'Vật Lí',
    dayOfWeek: 4, // Thứ 5
    timeSlot: '20:00 - 21:30',
    durationMinutes: 90,
    completed: false,
    priority: 'high',
    examTarget: 'THPTQG',
    notes: 'Học dạng bài ứng dụng con lắc và giảm chấn',
  },
  {
    id: 'task-5',
    title: 'Phân tích Biểu đồ & Số liệu thống kê HSA/V-ACT',
    subject: 'Đọc Hiểu (V-ACT/HSA)',
    dayOfWeek: 5, // Thứ 6
    timeSlot: '19:30 - 21:00',
    durationMinutes: 90,
    completed: false,
    priority: 'medium',
    examTarget: 'HSA',
    notes: 'Luyện tính toán % tăng trưởng và đọc biểu đồ tròn/cột kép',
  },
  {
    id: 'task-6',
    title: 'Giải 1 đề thi thử trọn vẹn (Bấm giờ nghiêm túc 150p)',
    subject: 'Tư Duy Logic (ĐGNL)',
    dayOfWeek: 6, // Thứ 7
    timeSlot: '08:00 - 10:30',
    durationMinutes: 150,
    completed: false,
    priority: 'high',
    examTarget: 'V-ACT',
    notes: 'Kiểm tra tốc độ làm bài và chữa kỹ các câu sai vào sổ tay',
  },
  {
    id: 'task-7',
    title: 'Tổng kết tuần, ghi chép sổ lỗi sai & Lập kế hoạch tuần tới',
    subject: 'Toán',
    dayOfWeek: 0, // Chủ nhật
    timeSlot: '20:00 - 21:00',
    durationMinutes: 60,
    completed: false,
    priority: 'medium',
    examTarget: 'Tất cả',
    notes: 'Đi ngủ sớm trước 22:30 để nạp năng lượng cho tuần mới',
  },
];

export const MOTIVATION_QUOTES = [
  {
    quote: 'Tương lai thuộc về những ai tin tưởng vào vẻ đẹp của ước mơ của mình.',
    author: 'Eleanor Roosevelt',
  },
  {
    quote: 'Chiếc vé vào cổng trường đại học mơ ước được in bằng những buổi tối kiên trì ngồi vào bàn học.',
    author: 'Lời nhắn gửi 2K9',
  },
  {
    quote: 'Đừng đợi đến lúc có cảm hứng mới bắt đầu học. Kỷ luật chính là bắt đầu ngay cả khi bạn không có cảm hứng.',
    author: 'Sĩ Tử Kỷ Luật',
  },
  {
    quote: 'Khổ luyện 300 ngày, tự hào cả một thanh xuân rực rỡ.',
    author: 'Tiếp sức mùa thi 2027',
  },
  {
    quote: 'Không có điểm số nào là quá cao nếu bạn biến việc ôn luyện thành thói quen mỗi ngày.',
    author: 'Thủ khoa chia sẻ',
  },
];

export const STUDY_TEMPLATES = [
  {
    name: 'Khối A00 & A01 (Tự nhiên & Công nghệ)',
    description: 'Phù hợp mục tiêu Bách Khoa, KHTN, Công Nghệ Thông Tin. Tập trung Toán, Lý, Hóa / Tiếng Anh kết hợp ĐGNL.',
    subjects: ['Toán', 'Vật Lí', 'Hóa Học', 'Tiếng Anh', 'Tư Duy Logic (ĐGNL)'],
  },
  {
    name: 'Chinh phục ĐGNL V-ACT & HSA',
    description: 'Chiến thuật bứt phá điểm số ĐHQG TP.HCM (mục tiêu 850+) và ĐHQG Hà Nội (100+). Tập trung Logic & Đọc hiểu.',
    subjects: ['Tư Duy Logic (ĐGNL)', 'Đọc Hiểu (V-ACT/HSA)', 'Toán', 'Khoa Học Tự Nhiên'],
  },
  {
    name: 'Khối D01 & Kinh tế - Ngoại thương',
    description: 'Phù hợp mục tiêu FTU, UEH, NEU, HUB. Cân bằng Toán, Ngữ Văn, Tiếng Anh và tư duy ngôn ngữ.',
    subjects: ['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Đọc Hiểu (V-ACT/HSA)'],
  },
  {
    name: 'Toàn Diện 2K9 (Tốt nghiệp + ĐGNL Song Mã)',
    description: 'Phân bổ đều các ngày trong tuần: 3 buổi chuyên sâu THPTQG, 2 buổi đề thi ĐGNL, 1 buổi tổng duyệt đề.',
    subjects: ['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Tư Duy Logic (ĐGNL)', 'Vật Lí'],
  },
];

export const DEFAULT_REMINDERS: ReminderSetting[] = [
  {
    id: 'remind-1',
    title: 'Khởi động ca học tối',
    time: '19:30',
    enabled: true,
    repeat: 'daily',
    description: 'Đến giờ ngồi vào bàn học rồi, tắt thông báo điện thoại và tập trung nhé!',
  },
  {
    id: 'remind-2',
    title: 'Giải đề ĐGNL / Đọc báo trau dồi từ vựng',
    time: '21:00',
    enabled: true,
    repeat: 'daily',
    description: 'Dành 45 phút rèn tư duy logic và đọc hiểu số liệu.',
  },
  {
    id: 'remind-3',
    title: 'Uống nước & Nghỉ mắt 5 phút',
    time: '20:30',
    enabled: true,
    repeat: 'daily',
    description: 'Thả lỏng vai, nhìn ra xa 20 giây để bảo vệ mắt.',
  },
  {
    id: 'remind-4',
    title: 'Nghỉ ngơi nạp năng lượng',
    time: '23:00',
    enabled: true,
    repeat: 'daily',
    description: 'Giấc ngủ ngon giúp não bộ lưu trữ kiến thức dài hạn. Chúc sĩ tử ngủ ngon!',
  },
];

// Play soft ambient audio chimes using Web Audio API
export function playChimeSound(type: 'start' | 'complete' | 'click' = 'complete') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'complete') {
      // Gentle cheerful pastel major triad chime (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + index * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.7);
      });
    } else if (type === 'start') {
      // Soft single bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } else {
      // Subtle click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);
    }
  } catch {
    // Ignore audio errors if audio context blocked by browser policy
  }
}
