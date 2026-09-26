import { NewsArticle } from '@/types/news';

export const EDUCATION_NEWS: NewsArticle[] = [
  {
    id: 'news-thpt-2027-format',
    title: 'Bộ GD&ĐT định hướng cấu trúc đề thi Tốt nghiệp THPT 2027 cho lứa học sinh 2K9',
    summary:
      'Đề thi tiếp tục bám sát định dạng GDPT 2018 với 3 phần: Trắc nghiệm nhiều lựa chọn, Đúng/Sai và Trả lời ngắn. Tăng cường đánh giá năng lực thực tiễn.',
    category: 'thpt',
    categoryLabel: 'THPTQG 2027',
    source: 'Cổng thông tin Bộ GD&ĐT',
    publishedAt: '24/09/2026',
    readTimeMinutes: 4,
    important: true,
    isHot: true,
    tags: ['THPTQG 2027', 'GDPT 2018', 'Cấu Trúc Đề', '2K9'],
    icon: '📜',
    colorScheme: {
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      border: 'border-rose-200',
      accent: '#e11d48',
    },
    content: {
      lead: 'Kỳ thi Tốt nghiệp THPT năm 2027 là dấu mốc quan trọng tiếp nối lộ trình đổi mới toàn diện theo Chương trình Giáo dục phổ thông 2018 dành cho các bạn học sinh sinh năm 2009 (2K9).',
      paragraphs: [
        'Theo thông tin định hướng từ Bộ Giáo dục và Đào tạo, kỳ thi tiếp tục giữ nguyên cấu trúc đề thi gồm 2 môn thi bắt buộc (Toán, Ngữ văn) và 2 môn tự chọn trong số các môn: Ngoại ngữ, Lịch sử, Địa lí, Vật lí, Hóa học, Sinh học, Tin học, Công nghệ.',
        'Điểm then chốt trong dạng câu hỏi: Giảm thiểu tối đa việc học tủ, học vẹt bằng việc đưa vào 2 định dạng câu hỏi mới: Dạng thức trắc nghiệm Đúng/Sai (yêu cầu phân tích sâu từng mệnh đề) và Dạng thức trắc nghiệm trả lời ngắn (yêu cầu tính toán, không thể dò đáp án may rủi).',
        'Ngữ văn tiếp tục sử dụng ngữ liệu hoàn toàn ngoài sách giáo khoa để kiểm tra thực chất kỹ năng đọc hiểu và năng lực nghị luận xã hội, văn học của học sinh.',
      ],
      keyTakeaways: [
        'Toán và Văn là 2 môn bắt buộc; chọn thêm 2 môn sở trường.',
        'Xuất hiện định dạng câu hỏi Trả lời ngắn và Đúng/Sai chiếm tỉ trọng lớn.',
        'Môn Văn tuyệt đối không dùng lại văn bản có sẵn trong SGK.',
        'Tập trung học bản chất kiến thức và kỹ năng đọc - tính - suy luận.',
      ],
      officialAdvice:
        'Sĩ tử 2K9 cần chủ động hệ thống hóa kiến thức lớp 10, 11 và chuẩn bị tinh thần tự học, tăng cường đọc báo chí chính thống để mở rộng vốn sống cho bài viết nghị luận.',
    },
  },
  {
    id: 'news-vact-2027-plan',
    title: 'ĐHQG-HCM công bố định hướng kỳ thi Đánh giá năng lực V-ACT năm 2027',
    summary:
      'Kỳ thi dự kiến giữ ổn định 2 đợt thi tại hơn 25 tỉnh/thành. Bài thi 120 câu hỏi trắc nghiệm trong 150 phút, đánh giá tư duy logic và suy luận dữ liệu.',
    category: 'dgnl',
    categoryLabel: 'ĐGNL V-ACT',
    source: 'Trung tâm Khảo thí ĐHQG-HCM',
    publishedAt: '22/09/2026',
    readTimeMinutes: 3,
    important: true,
    isHot: true,
    tags: ['V-ACT', 'ĐHQG-HCM', 'Đánh Giá Năng Lực', 'Xét Tuyển Sớm'],
    icon: '🎯',
    colorScheme: {
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      border: 'border-purple-200',
      accent: '#7c3aed',
    },
    content: {
      lead: 'Kỳ thi Đánh giá năng lực Đại học Quốc gia TP.HCM (V-ACT) tiếp tục là phương thức tuyển sinh thu hút số lượng thí sinh đông đảo nhất khu vực phía Nam.',
      paragraphs: [
        'Bài thi V-ACT có thang điểm chuẩn 1.200 điểm, gồm 120 câu hỏi trắc nghiệm khách quan chia làm 3 phần: Sử dụng ngôn ngữ (Tiếng Việt và Tiếng Anh), Toán học - Tư duy logic - Phân tích số liệu, và Giải quyết vấn đề (Khoa học tự nhiên & Khoa học xã hội).',
        'ĐHQG-HCM khẳng định đề thi không đòi hỏi thí sinh phải học thuộc lòng công thức máy móc mà chú trọng vào kỹ năng đọc hiểu văn bản khoa học, biểu đồ thống kê, chuỗi logic và vận dụng thực tiễn.',
        'Hơn 100 trường đại học, cao đẳng trên cả nước tiếp tục sử dụng kết quả V-ACT để xét tuyển chỉ tiêu lớn.',
      ],
      keyTakeaways: [
        'Thời gian làm bài: 150 phút cho 120 câu hỏi (trung bình 75 giây/câu).',
        'Kỹ năng phân tích bảng số liệu và tư duy suy luận đóng vai trò phân hóa điểm cao.',
        'Nên tham gia cả 2 đợt thi để tối ưu điểm số và giảm áp lực phòng thi.',
      ],
      officialAdvice:
        'Hãy luyện thói quen đọc nhanh tài liệu khoa học, giải đố logic và luyện các dạng biểu đồ Venn, biểu đồ cột/tròn thường xuyên.',
    },
  },
  {
    id: 'news-hsa-2027-expansion',
    title: 'ĐHQG Hà Nội mở rộng quy mô tổ chức kỳ thi ĐGNL HSA 2027 với 6 đợt thi',
    summary:
      'Các đợt thi HSA diễn ra từ tháng 3 đến tháng 6 năm 2027 trên máy tính. Kết quả được bảo lưu 2 năm và được gần 90 trường đại học công nhận.',
    category: 'dgnl',
    categoryLabel: 'ĐGNL HSA',
    source: 'Trung tâm Khảo thí ĐHQG-HN',
    publishedAt: '20/09/2026',
    readTimeMinutes: 3,
    important: false,
    tags: ['HSA', 'ĐHQG Hà Nội', 'Thi Trên Máy Tính', 'Miền Bắc'],
    icon: '💻',
    colorScheme: {
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      border: 'border-emerald-200',
      accent: '#059669',
    },
    content: {
      lead: 'Kỳ thi Đánh giá năng lực học sinh THPT (HSA) do ĐHQG Hà Nội tổ chức trên máy tính mang lại tính bảo mật cao và kết quả trả về tức thì.',
      paragraphs: [
        'Bài thi gồm 150 câu hỏi trắc nghiệm và điền số, thời lượng 195 phút. Cấu trúc gồm: Phần 1 - Tư duy định lượng (Toán học), Phần 2 - Tư duy định tính (Ngữ văn - Ngôn ngữ), và Phần 3 - Khoa học (Lựa chọn Tự nhiên hoặc Xã hội).',
        'Hệ thống thi trên máy tính có ngân hàng đề thi phong phú, mỗi thí sinh có một mã đề riêng biệt với độ cân bằng chuẩn hóa cao.',
        'Thí sinh được đăng ký tối đa 2 đợt thi trong năm để có cơ hội nâng cao điểm số của mình.',
      ],
      keyTakeaways: [
        'Thi hoàn toàn trên máy tính, biết điểm ngay sau khi hết giờ nộp bài.',
        'Mỗi thí sinh được thi tối đa 2 lần/năm (cách nhau tối thiểu 28 ngày).',
        'Gần 90 trường đại học phía Bắc ưu tiên xét tuyển kết quả HSA.',
      ],
      officialAdvice:
        'Cần làm quen thao tác bấm phím, nhập kết quả trên máy tính và quản lý thời gian đồng hồ đếm ngược trên màn hình.',
    },
  },
  {
    id: 'news-tsa-bach-khoa',
    title: 'Đại học Bách Khoa Hà Nội: Cấu trúc bài thi Đánh giá tư duy TSA 2027',
    summary:
      'Bài thi TSA tập trung vào 3 khối tư duy: Tư duy Toán học (60p), Tư duy Đọc hiểu (30p), và Tư duy Khoa học/Giải quyết vấn đề (60p).',
    category: 'dgnl',
    categoryLabel: 'ĐGTD TSA Bách Khoa',
    source: 'Đại học Bách Khoa Hà Nội',
    publishedAt: '18/09/2026',
    readTimeMinutes: 4,
    important: false,
    tags: ['TSA', 'Bách Khoa', 'Khối Kỹ Thuật', 'Đánh Giá Tư Duy'],
    icon: '⚙️',
    colorScheme: {
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      border: 'border-amber-200',
      accent: '#d97706',
    },
    content: {
      lead: 'Bài thi Đánh giá tư duy TSA của ĐH Bách Khoa Hà Nội là chìa khóa xét tuyển vào các khối ngành Công nghệ Thông tin, Kỹ thuật và Kinh tế hàng đầu.',
      paragraphs: [
        'Đề thi TSA không kiểm tra việc nhớ định lý hay công thức phức tạp, mà cung cấp sẵn các định nghĩa, bối cảnh thí nghiệm để thí sinh tự phân tích và rút ra kết luận.',
        'Bài thi có 3 dạng câu hỏi: Chọn 1 trong 4 đáp án, Chọn đúng/sai từng ý, và Kéo thả / Điền đáp số ngắn.',
        'Tổng điểm bài thi là 100 điểm, thời gian làm bài 150 phút.',
      ],
      keyTakeaways: [
        'Không đòi hỏi học trước kiến thức quá sâu, trọng tâm là khả năng tự đọc và hiểu hiện tượng.',
        'Dạng câu hỏi kéo thả và đúng/sai yêu cầu tư duy mạch lạc và cẩn thận.',
        'Có giá trị xét tuyển vào hơn 30 trường khối kỹ thuật, công nghệ toàn quốc.',
      ],
      officialAdvice:
        'Luyện đọc các bài báo nghiên cứu khoa học phổ thông (Tia Sáng, Khoa học & Đời sống) để quen cách lập luận kỹ thuật.',
    },
  },
  {
    id: 'news-ielts-sat-admissions',
    title: 'Xu hướng quy đổi chứng chỉ ngoại ngữ (IELTS, TOEFL) & SAT trong tuyển sinh ĐH 2027',
    summary:
      'Các trường đại học top đầu (FTU, NEU, BKHN, ĐHQG) tiếp tục kết hợp điểm thi tốt nghiệp/ĐGNL với chứng chỉ IELTS 6.5+ hoặc SAT 1350+.',
    category: 'tuyen-sinh',
    categoryLabel: 'Quy chế Tuyển Sinh',
    source: 'Tổng hợp từ các trường ĐH',
    publishedAt: '16/09/2026',
    readTimeMinutes: 3,
    important: true,
    tags: ['IELTS', 'SAT', 'Xét Tuyển Kết Hợp', 'Đại Học Top'],
    icon: '🌐',
    colorScheme: {
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      border: 'border-sky-200',
      accent: '#0284c7',
    },
    content: {
      lead: 'Phương thức xét tuyển kết hợp chứng chỉ quốc tế và học bạ/điểm thi vẫn giữ vị trí chủ lực trong đề án tuyển sinh các trường tốp đầu.',
      paragraphs: [
        'Mức điểm IELTS phổ biến để được quy đổi điểm 10 môn Ngoại ngữ hoặc cộng điểm thưởng dao động từ 6.5 trở lên. Với chứng chỉ SAT, mức điểm từ 1.300 - 1.450 mang lại lợi thế cạnh tranh rất lớn.',
        'Tuy nhiên, Bộ GD&ĐT quy định rõ các trường phải bảo đảm công bằng, không dành quá nhiều tỉ lệ chỉ tiêu cho một phương thức đơn lẻ.',
        'Sĩ tử 2K9 nên có chứng chỉ trước học kỳ 1 năm lớp 12 để thảnh thơi dồn toàn lực ôn thi các môn văn hóa.',
      ],
      keyTakeaways: [
        'IELTS 6.5+ hoặc SAT 1300+ là ngưỡng an toàn để xét tuyển kết hợp.',
        'Cần thi lấy chứng chỉ muộn nhất vào cuối năm lớp 11 hoặc đầu lớp 12.',
        'Vẫn bắt buộc đạt điểm sàn tốt nghiệp THPT theo quy chế tuyển sinh chung.',
      ],
      officialAdvice:
        'Chứng chỉ chỉ là điều kiện cần, điểm tổ hợp hoặc điểm ĐGNL mới là điều kiện đủ quyết định việc trúng tuyển NV1.',
    },
  },
  {
    id: 'news-study-method-2k9',
    title: 'Cẩm nang bứt phá cho 2K9: Lộ trình 3 giai đoạn chinh phục kỳ thi 2027',
    summary:
      'Chuyên gia giáo dục chia sẻ chiến lược: Giai đoạn 1 (Nắm chắc nền tảng), Giai đoạn 2 (Tổng ôn chuyên đề & rèn đề ĐGNL), Giai đoạn 3 (Thực chiến & chuẩn bị tâm lý).',
    category: 'cam-nang',
    categoryLabel: 'Cẩm nang 2K9',
    source: 'Ban Tư Vấn Hướng Nghiệp',
    publishedAt: '14/09/2026',
    readTimeMinutes: 5,
    important: false,
    tags: ['Lộ Trình 2027', 'Bí Quyết Ôn Thi', 'Sức Bền Tâm Lý', 'Pomodoro'],
    icon: '💡',
    colorScheme: {
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      border: 'border-indigo-200',
      accent: '#4f46e5',
    },
    content: {
      lead: 'Học sinh 2K9 bước vào năm bản lề với nhiều đổi mới thi cử, đòi hỏi chiến lược ôn tập thông minh và kỷ luật bền bỉ.',
      paragraphs: [
        'Giai đoạn 1 (Lớp 11 đến hết kỳ 1 lớp 12): Quét sạch kiến thức nền tảng sách giáo khoa, xây dựng thói quen ghi chú Spaced Repetition và học theo chu kỳ Pomodoro.',
        'Giai đoạn 2 (Tháng 1 đến tháng 4/2027): Tổng ôn các dạng bài nâng cao, luyện thi thử ĐGNL V-ACT đợt 1 và HSA đợt 1-2 để cọ xát phòng thi thực tế.',
        'Giai đoạn 3 (Tháng 5 đến ngày thi tốt nghiệp): Tinh chỉnh lại các lỗ hổng kiến thức, làm đề chuẩn thời gian và điều chỉnh đồng hồ sinh học ngủ sớm - dậy đúng giờ.',
      ],
      keyTakeaways: [
        'Kỷ luật hàng ngày hơn học dồn dập vào phút chót.',
        'Kết hợp công cụ Lập lịch học 7 ngày và Pomodoro để duy trì chuỗi học tập.',
        'Giữ gìn sức khỏe tinh thần và không so sánh bản thân với người khác.',
      ],
      officialAdvice:
        'Mỗi ngày tiến bộ 1% sẽ tạo nên sự bứt phá thần kỳ sau 365 ngày ôn luyện. Chúc các sĩ tử 2K9 luôn vững tâm!',
    },
  },
];
