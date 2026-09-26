import { ExamEvent, PomodoroSettings, ReminderSetting, StudyTask, UserProfile } from '@/types/exam';

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
    // Mốc 2027: ≈ giữa tháng 06/2027 (Lịch 2026 thực tế: 11–12/06/2026) -> 11/06/2027
    targetDate: '2027-06-11T07:30:00',
    description: 'Kỳ thi tốt nghiệp THPT theo chương trình GDPT mới (2 môn bắt buộc Toán, Văn + 2 môn tự chọn). Mốc tham chiếu 2026: 11–12/06/2026.',
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
      'Lịch thực tế 2026 diễn ra vào giữa tháng 6 (11–12/06/2026). Thế hệ 2K9 sẽ bước vào kỳ thi sớm hơn các năm trước!',
      'Nắm chắc 7 điểm đầu tiên trong đề thi mẫu GDPT 2018 trước khi đào sâu câu vận dụng cao.',
      'Môn Toán mới có thêm dạng trắc nghiệm đúng/sai và điền kết quả ngắn, hãy luyện kỹ kỹ năng bấm máy và lập luận nhanh.',
      'Ngữ Văn không dùng ngữ liệu trong SGK: rèn luyện kỹ năng đọc hiểu văn bản mở và viết nghị luận xã hội súc tích.',
    ],
    totalQuestionCount: 4,
    durationMinutes: 450,
  },
  {
    id: 'vact-2027',
    name: 'Đánh giá Năng lực ĐHQG TP.HCM 2027 (Đợt 1 & Đợt 2)',
    shortName: 'V-ACT 2027 (ĐHQG-HCM)',
    // Default to Round 1: đầu 04/2027 (Lịch 2026: 05/04/2026) -> 04/04/2027
    targetDate: '2027-04-04T07:30:00',
    description: 'Kỳ thi ĐGNL lớn nhất miền Nam gồm 2 đợt thi (Đợt 1: đầu tháng 4/2027 & Đợt 2: cuối tháng 5/2027) với hơn 100 trường ĐH xét tuyển. Thang điểm 1200.',
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
      'Lịch chuẩn tham chiếu: Đợt 1 vào 05/04/2026 (≈ đầu 04/2027); Đợt 2 vào 24/05/2026 (≈ cuối 05/2027).',
      '120 câu trong 150 phút: Trung bình 1 phút 15 giây cho mỗi câu, tuyệt đối không sa đà vào một câu quá 2 phút.',
      'Hai đợt thi: Đa số các trường ĐH xét điểm đợt cao nhất, hãy tận dụng Đợt 1 để thử sức và bứt phá ở Đợt 2.',
      'Phần Tư duy Logic & Phân tích số liệu là phần phân loại thí sinh cao nhất, hãy luyện vẽ sơ đồ Venn và bảng logic.',
    ],
    totalQuestionCount: 120,
    durationMinutes: 150,
    subRounds: [
      {
        id: 'vact-2027-d1',
        name: 'V-ACT Đợt 1',
        shortName: 'Đợt 1',
        targetDate: '2027-04-04T07:30:00',
        description: 'Đợt 1: ≈ đầu 04/2027 (Lịch 2026 thực tế: 05/04/2026)',
        reference2026: '2026: 05/04/2026',
      },
      {
        id: 'vact-2027-d2',
        name: 'V-ACT Đợt 2',
        shortName: 'Đợt 2',
        targetDate: '2027-05-23T07:30:00',
        description: 'Đợt 2: ≈ cuối 05/2027 (Lịch 2026 thực tế: 24/05/2026)',
        reference2026: '2026: 24/05/2026',
      },
    ],
  },
  {
    id: 'hsa-2027',
    name: 'Đánh giá Năng lực ĐHQG Hà Nội 2027 (6 Đợt Thi)',
    shortName: 'HSA 2027 (ĐHQG-HN)',
    // Default to Round 1: đầu 03/2027 (Lịch 2026: 07–08/03/2026) -> 06/03/2027
    targetDate: '2027-03-06T07:30:00',
    description: 'Kỳ thi HSA trên máy tính của ĐHQGHN với 6 đợt thi kéo dài từ đầu tháng 3 đến cuối tháng 5/2027. Thang điểm 150.',
    badge: 'HSA (6 Đợt)',
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
      'Lịch 6 đợt thi chuẩn tham chiếu 2026: Đợt 1 (07–08/03), Đợt 2 (21–22/03), Đợt 3 (04–05/04), Đợt 4 (18–19/04), Đợt 5 (09–10/05), Đợt 6 (23–24/05).',
      'Thi trên máy tính: Làm quen với giao diện trắc nghiệm máy và câu hỏi điền số trực tiếp.',
      'Phần Tư duy định lượng (Toán học): Chú ý các câu hỏi ứng dụng thực tế và xác suất thống kê.',
      'Chuẩn bị tâm lý vững vàng vì đồng hồ đếm ngược hiển thị trực tiếp trên màn hình thi.',
    ],
    totalQuestionCount: 150,
    durationMinutes: 195,
    subRounds: [
      {
        id: 'hsa-2027-d1',
        name: 'HSA Đợt 1',
        shortName: 'Đợt 1',
        targetDate: '2027-03-06T07:30:00',
        description: 'HSA Đợt 1: ≈ đầu 03/2027 (Lịch 2026: 07–08/03/2026)',
        reference2026: '2026: 07–08/03/2026',
      },
      {
        id: 'hsa-2027-d2',
        name: 'HSA Đợt 2',
        shortName: 'Đợt 2',
        targetDate: '2027-03-20T07:30:00',
        description: 'HSA Đợt 2: ≈ cuối 03/2027 (Lịch 2026: 21–22/03/2026)',
        reference2026: '2026: 21–22/03/2026',
      },
      {
        id: 'hsa-2027-d3',
        name: 'HSA Đợt 3',
        shortName: 'Đợt 3',
        targetDate: '2027-04-03T07:30:00',
        description: 'HSA Đợt 3: ≈ đầu 04/2027 (Lịch 2026: 04–05/04/2026)',
        reference2026: '2026: 04–05/04/2026',
      },
      {
        id: 'hsa-2027-d4',
        name: 'HSA Đợt 4',
        shortName: 'Đợt 4',
        targetDate: '2027-04-17T07:30:00',
        description: 'HSA Đợt 4: ≈ giữa/cuối 04/2027 (Lịch 2026: 18–19/04/2026)',
        reference2026: '2026: 18–19/04/2026',
      },
      {
        id: 'hsa-2027-d5',
        name: 'HSA Đợt 5',
        shortName: 'Đợt 5',
        targetDate: '2027-05-08T07:30:00',
        description: 'HSA Đợt 5: ≈ đầu 05/2027 (Lịch 2026: 09–10/05/2026)',
        reference2026: '2026: 09–10/05/2026',
      },
      {
        id: 'hsa-2027-d6',
        name: 'HSA Đợt 6',
        shortName: 'Đợt 6',
        targetDate: '2027-05-22T07:30:00',
        description: 'HSA Đợt 6: ≈ cuối 05/2027 (Lịch 2026: 23–24/05/2026)',
        reference2026: '2026: 23–24/05/2026',
      },
    ],
  },
  {
    id: 'tsa-2027',
    name: 'Đánh giá Tư duy ĐH Bách Khoa Hà Nội 2027 (3 Đợt Thi)',
    shortName: 'TSA 2027 (HUST)',
    // Default to Round 1: cuối 01/2027 (Lịch 2026: 24–25/01/2026) -> 23/01/2027
    targetDate: '2027-01-23T07:30:00',
    description: 'Kỳ thi ĐGTD nổi tiếng của ĐH Bách Khoa Hà Nội gồm 3 đợt thi sớm (Đợt 1: cuối 01/2027, Đợt 2: giữa 03/2027, Đợt 3: giữa 05/2027). Thang điểm 100.',
    badge: 'TSA (3 Đợt)',
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
      'Lịch 3 đợt tham chiếu 2026: Đợt 1 (24–25/01/2026 ≈ cuối 01/2027), Đợt 2 (14–15/03/2026 ≈ giữa 03/2027), Đợt 3 (16–17/05/2026 ≈ giữa 05/2027).',
      '3 phần thi: Tư duy Toán học, Tư duy Đọc hiểu và Tư duy Khoa học/Giải quyết vấn đề.',
      'Không yêu cầu học vẹt kiến thức mà đòi hỏi khả năng suy luận, đọc hiểu dữ liệu thí nghiệm khoa học.',
    ],
    totalQuestionCount: 100,
    durationMinutes: 150,
    subRounds: [
      {
        id: 'tsa-2027-d1',
        name: 'TSA Đợt 1',
        shortName: 'Đợt 1',
        targetDate: '2027-01-23T07:30:00',
        description: 'TSA Đợt 1: ≈ cuối 01/2027 (Lịch 2026 thực tế: 24–25/01/2026)',
        reference2026: '2026: 24–25/01/2026',
      },
      {
        id: 'tsa-2027-d2',
        name: 'TSA Đợt 2',
        shortName: 'Đợt 2',
        targetDate: '2027-03-13T07:30:00',
        description: 'TSA Đợt 2: ≈ giữa 03/2027 (Lịch 2026 thực tế: 14–15/03/2026)',
        reference2026: '2026: 14–15/03/2026',
      },
      {
        id: 'tsa-2027-d3',
        name: 'TSA Đợt 3',
        shortName: 'Đợt 3',
        targetDate: '2027-05-15T07:30:00',
        description: 'TSA Đợt 3: ≈ giữa 05/2027 (Lịch 2026 thực tế: 16–17/05/2026)',
        reference2026: '2026: 16–17/05/2026',
      },
    ],
  },
  {
    id: 'hsca-2027',
    name: 'Đánh giá Năng lực Chuyên biệt ĐH Sư phạm TP.HCM 2027 (H-SCA)',
    shortName: 'H-SCA 2027 (HCMUE)',
    // Default to Round 1: cuối 03/2027 (Lịch 2026: 26–29/03/2026) -> 26/03/2027
    targetDate: '2027-03-26T07:30:00',
    description: 'Kỳ thi ĐGNL chuyên biệt của ĐH Sư phạm TP.HCM gồm 3 đợt thi (Đợt 1: cuối 03/2027, Đợt 2: đầu 05/2027, Đợt 3: cuối 05/2027). Thang điểm 10.',
    badge: 'H-SCA (3 Đợt)',
    colorScheme: {
      bg: 'bg-purple-50/80',
      border: 'border-purple-200/80',
      text: 'text-purple-950',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-700',
      accent: '#9333ea',
      progressFill: 'from-purple-300 to-indigo-400',
    },
    tips: [
      'Lịch 3 đợt tham chiếu 2026: Đợt 1 (26–29/03/2026 ≈ cuối 03/2027), Đợt 2 (07–10/05/2026 ≈ đầu 05/2027), Đợt 3 (29–31/05/2026 ≈ cuối 05/2027).',
      'Đề thi bám sát chương trình GDPT 2018 theo từng môn chuyên biệt (Toán, Lý, Hóa, Sinh, Văn, Tiếng Anh).',
      'Điểm bài thi chuyên biệt nhân hệ số 2 khi xét tuyển vào các ngành sư phạm và ngoài sư phạm của HCMUE.',
    ],
    durationMinutes: 90,
    subRounds: [
      {
        id: 'hsca-2027-d1',
        name: 'H-SCA Đợt 1',
        shortName: 'Đợt 1',
        targetDate: '2027-03-26T07:30:00',
        description: 'H-SCA Đợt 1: ≈ cuối 03/2027 (Lịch 2026 thực tế: 26–29/03/2026)',
        reference2026: '2026: 26–29/03/2026',
      },
      {
        id: 'hsca-2027-d2',
        name: 'H-SCA Đợt 2',
        shortName: 'Đợt 2',
        targetDate: '2027-05-07T07:30:00',
        description: 'H-SCA Đợt 2: ≈ đầu 05/2027 (Lịch 2026 thực tế: 07–10/05/2026)',
        reference2026: '2026: 07–10/05/2026',
      },
      {
        id: 'hsca-2027-d3',
        name: 'H-SCA Đợt 3',
        shortName: 'Đợt 3',
        targetDate: '2027-05-28T07:30:00',
        description: 'H-SCA Đợt 3: ≈ cuối 05/2027 (Lịch 2026 thực tế: 29–31/05/2026)',
        reference2026: '2026: 29–31/05/2026',
      },
    ],
  },
  {
    id: 'spt-2027',
    name: 'Đánh giá Năng lực ĐH Sư phạm Hà Nội 2027 (SPT)',
    shortName: 'SPT 2027 (HNUE)',
    // Default to Round 1: cuối 05/2027 (Lịch 2026: 23–24/05/2026) -> 22/05/2027
    targetDate: '2027-05-22T07:30:00',
    description: 'Kỳ thi ĐGNL của ĐH Sư phạm Hà Nội gồm 2 đợt thi tập trung cuối tháng 5/2027 (Đợt 1: 22–23/05/2027, Đợt 2: 29–30/05/2027).',
    badge: 'SPT (2 Đợt)',
    colorScheme: {
      bg: 'bg-teal-50/80',
      border: 'border-teal-200/80',
      text: 'text-teal-950',
      badgeBg: 'bg-teal-100',
      badgeText: 'text-teal-800',
      accent: '#0d9488',
      progressFill: 'from-teal-300 to-emerald-400',
    },
    tips: [
      'Lịch 2 đợt tham chiếu 2026: Đợt 1 (23–24/05/2026 ≈ cuối 05/2027), Đợt 2 (30–31/05/2026 ≈ cuối 05/2027).',
      'Đề thi kết hợp trắc nghiệm khách quan và tự luận đối với môn Toán và Ngữ Văn.',
      'Được nhiều trường đại học sư phạm và trường đào tạo đa ngành công nhận kết quả xét tuyển.',
    ],
    durationMinutes: 90,
    subRounds: [
      {
        id: 'spt-2027-d1',
        name: 'SPT Đợt 1',
        shortName: 'Đợt 1',
        targetDate: '2027-05-22T07:30:00',
        description: 'SPT Đợt 1: ≈ cuối 05/2027 (Lịch 2026 thực tế: 23–24/05/2026)',
        reference2026: '2026: 23–24/05/2026',
      },
      {
        id: 'spt-2027-d2',
        name: 'SPT Đợt 2',
        shortName: 'Đợt 2',
        targetDate: '2027-05-29T07:30:00',
        description: 'SPT Đợt 2: ≈ cuối 05/2027 (Lịch 2026 thực tế: 30–31/05/2026)',
        reference2026: '2026: 30–31/05/2026',
      },
    ],
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

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  syncWithSchedule: true,
  ambientSound: 'none',
};

export const POMODORO_PRESETS = [
  {
    id: 'classic',
    name: 'Tiêu Chuẩn (25/5)',
    description: 'Phương pháp Pomodoro kinh điển: 25 phút tập trung cao độ, 5 phút xả hơi.',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  },
  {
    id: 'ultradian',
    name: 'Học Sâu Ultradian (50/10)',
    description: 'Theo nhịp sinh học não bộ: 50 phút tư duy chuyên sâu, 10 phút hồi phục.',
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
  },
  {
    id: 'thptqg-speed',
    name: 'Thực Chiến THPT (90/15)',
    description: 'Khớp đúng thời gian làm bài thi môn Toán / Khoa học THPTQG.',
    focusMinutes: 90,
    shortBreakMinutes: 15,
    longBreakMinutes: 25,
  },
  {
    id: 'vact-mock',
    name: 'Mô Phỏng ĐGNL (150/20)',
    description: 'Luyện sức bền tâm lý 150 phút cho đề thi ĐGNL ĐHQG-HCM & ĐHQG-HN.',
    focusMinutes: 150,
    shortBreakMinutes: 20,
    longBreakMinutes: 30,
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
