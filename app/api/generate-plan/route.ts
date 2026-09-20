import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      university = 'Đại học Bách Khoa TP.HCM',
      major = 'Khoa học Máy tính',
      targetScore = '27.5+ / 900+ ĐGNL',
      weakSubjects = ['Toán', 'Tư duy logic'],
      targetExams = ['THPTQG 2027', 'V-ACT 2027'],
      hoursPerDay = 3,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback template if API key is not yet set
    if (!apiKey) {
      return NextResponse.json({
        plan: [
          {
            dayOfWeek: 1,
            dayName: 'Thứ Hai',
            subject: 'Toán học (GDPT 2018)',
            timeSlot: '19:30 - 21:30',
            durationMinutes: 120,
            task: `Ôn tập nền tảng Toán & luyện dạng trắc nghiệm đúng/sai cho mục tiêu ${university}`,
            examTarget: 'THPTQG',
            tip: 'Tập trung tính toán cẩn thận phần đạo hàm và đồ thị hàm số.',
          },
          {
            dayOfWeek: 2,
            dayName: 'Thứ Ba',
            subject: 'Tư Duy Logic & ĐGNL',
            timeSlot: '20:00 - 21:30',
            durationMinutes: 90,
            task: `Luyện đề Logic V-ACT / HSA theo chủ đề phân tích vị trí & suy luận logic`,
            examTarget: 'V-ACT',
            tip: 'Vẽ sơ đồ bảng để suy luận nhanh, không đọc nhẩm trong đầu.',
          },
          {
            dayOfWeek: 3,
            dayName: 'Thứ Tư',
            subject: 'Ngữ Văn / Đọc Hiểu Mở',
            timeSlot: '19:30 - 21:00',
            durationMinutes: 90,
            task: 'Rèn kỹ năng đọc hiểu văn bản ngoài SGK và viết đoạn nghị luận xã hội 200 chữ',
            examTarget: 'THPTQG',
            tip: 'Lấy dẫn chứng thời sự gần gũi và tư duy lập luận nhiều chiều.',
          },
          {
            dayOfWeek: 4,
            dayName: 'Thứ Năm',
            subject: 'Môn Chuyên Sâu (Lý / Hóa / Anh)',
            timeSlot: '19:30 - 21:30',
            durationMinutes: 120,
            task: `Củng cố kiến thức chuyên ngành phục vụ ngành ${major}`,
            examTarget: 'THPTQG',
            tip: 'Hệ thống hóa kiến thức bằng sơ đồ tư duy (Mindmap).',
          },
          {
            dayOfWeek: 5,
            dayName: 'Thứ Sáu',
            subject: 'Phân Tích Số Liệu & Toán Thực Tế',
            timeSlot: '20:00 - 21:30',
            durationMinutes: 90,
            task: 'Luyện 20 câu xử lý bảng số liệu, biểu đồ hình cột/tròn trong đề ĐGNL',
            examTarget: 'HSA',
            tip: 'Làm quen với tính nhẩm tỷ lệ phần trăm ước lượng.',
          },
          {
            dayOfWeek: 6,
            dayName: 'Thứ Bảy',
            subject: 'Tổng Duyệt Đề Toàn Diện',
            timeSlot: '08:00 - 10:30',
            durationMinutes: 150,
            task: `Bấm giờ giải trọn vẹn 1 đề thi thử ĐGNL hoặc 2 đề trắc nghiệm chuyên đề`,
            examTarget: 'Tất cả',
            tip: 'Bắt buộc chữa kỹ lại từng câu sai và ghi chú vào Sổ tay phục thù.',
          },
          {
            dayOfWeek: 0,
            dayName: 'Chủ Nhật',
            subject: 'Đánh Giá Tiến Độ & Nạp Năng Lượng',
            timeSlot: '19:30 - 20:30',
            durationMinutes: 60,
            task: `Review lại mục tiêu tuần, chuẩn bị bài vở tuần mới và đi ngủ sớm`,
            examTarget: 'Tất cả',
            tip: 'Một tinh thần sảng khoái và giấc ngủ đủ sẽ giúp bạn bứt phá vào tuần tới!',
          },
        ],
        advice: `Để đỗ vào ${university} - ngành ${major} với mục tiêu ${targetScore}, bạn cần duy trì tính kỷ luật đều đặn mỗi ngày từ 2 đến 3 tiếng. Hãy chú trọng kết hợp cả kỳ thi THPTQG và các kỳ thi ĐGNL để nhân đôi cơ hội trúng tuyển sớm!`,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Bạn là chuyên gia tư vấn giáo dục và thủ khoa ôn thi THPT Quốc Gia & Đánh Giá Năng Lực (V-ACT ĐHQG TP.HCM, HSA ĐHQG Hà Nội) cho học sinh thế hệ 2K9 (kỳ thi năm 2027 theo chương trình GDPT 2018 mới).

Thông tin sĩ tử:
- Trường mơ ước (Nguyện vọng 1): ${university}
- Ngành mong muốn: ${major}
- Điểm số mục tiêu: ${targetScore}
- Môn/phần thi cảm thấy còn yếu cần cải thiện: ${Array.isArray(weakSubjects) ? weakSubjects.join(', ') : weakSubjects}
- Các kỳ thi dự kiến tham gia: ${Array.isArray(targetExams) ? targetExams.join(', ') : targetExams}
- Thời gian có thể tự học mỗi ngày: ${hoursPerDay} giờ

Nhiệm vụ: Hãy tạo một thời khóa biểu học tập 7 ngày trong tuần thông minh, thực tế, chống nản và tối ưu hóa năng lực cho bạn ấy, cùng lời khuyên chiến lược trúng tuyển.

Trả về DUY NHẤT một định dạng JSON hợp lệ (không chứa markdown backticks, chỉ JSON thuần túy) với cấu trúc:
{
  "advice": "Lời khuyên ngắn gọn, sắc bén và truyền cảm hứng (khoảng 2-3 câu)",
  "plan": [
    {
      "dayOfWeek": 1, // 1: Thứ Hai, 2: Thứ Ba, 3: Thứ Tư, 4: Thứ Năm, 5: Thứ Sáu, 6: Thứ Bảy, 0: Chủ Nhật
      "dayName": "Thứ Hai",
      "subject": "Tên môn",
      "timeSlot": "19:30 - 21:00",
      "durationMinutes": 90,
      "task": "Nội dung học cụ thể, hành động rõ ràng",
      "examTarget": "THPTQG" | "V-ACT" | "HSA" | "Tất cả",
      "tip": "Mẹo học nhanh hoặc lưu ý cho buổi học này"
    }
    // đủ cho 7 ngày (từ Thứ Hai đến Chủ Nhật)
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    // Clean potential code fences
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in study plan generation:', error);
    // Fallback response so user always gets a seamless experience
    return NextResponse.json({
      plan: [
        {
          dayOfWeek: 1,
          dayName: 'Thứ Hai',
          subject: 'Toán học (GDPT 2018)',
          timeSlot: '19:30 - 21:30',
          durationMinutes: 120,
          task: 'Ôn tập Hàm số, Khảo sát đồ thị & trắc nghiệm đúng/sai',
          examTarget: 'THPTQG',
          tip: 'Chú ý dạng câu hỏi suy luận nhanh và các câu hỏi thực tế.',
        },
        {
          dayOfWeek: 2,
          dayName: 'Thứ Ba',
          subject: 'Tư Duy Logic & ĐGNL',
          timeSlot: '20:00 - 21:30',
          durationMinutes: 90,
          task: 'Luyện đề Logic V-ACT / HSA theo chủ đề sắp xếp vị trí & mệnh đề',
          examTarget: 'V-ACT',
          tip: 'Vẽ bảng ma trận để loại trừ đáp án nhanh.',
        },
        {
          dayOfWeek: 3,
          dayName: 'Thứ Tư',
          subject: 'Ngữ Văn & Đọc Hiểu',
          timeSlot: '19:30 - 21:00',
          durationMinutes: 90,
          task: 'Luyện kỹ năng đọc hiểu văn bản mở và viết đoạn NLXH 200 chữ',
          examTarget: 'THPTQG',
          tip: 'Liên hệ các vấn đề thời sự của giới trẻ thời công nghệ.',
        },
        {
          dayOfWeek: 4,
          dayName: 'Thứ Năm',
          subject: 'Tiếng Anh / Môn Tự Chọn',
          timeSlot: '19:30 - 21:30',
          durationMinutes: 120,
          task: 'Chuyên đề Ngữ pháp ứng dụng, Đọc điền từ & Từ vựng theo ngữ cảnh',
          examTarget: 'THPTQG',
          tip: 'Học từ vựng theo cụm Collocation thay vì học từ đơn lẻ.',
        },
        {
          dayOfWeek: 5,
          dayName: 'Thứ Sáu',
          subject: 'Phân Tích Số Liệu ĐGNL',
          timeSlot: '20:00 - 21:30',
          durationMinutes: 90,
          task: 'Xử lý biểu đồ tròn, đường, cột và bảng số liệu thống kê',
          examTarget: 'HSA',
          tip: 'Ước lượng tỷ lệ % và loại trừ đáp án vô lý.',
        },
        {
          dayOfWeek: 6,
          dayName: 'Thứ Bảy',
          subject: 'Giải Đề Toàn Diện & Chữa Chi Tiết',
          timeSlot: '08:00 - 10:30',
          durationMinutes: 150,
          task: 'Thi thử nghiêm túc 1 đề ĐGNL hoặc 2 đề thành phần theo đúng áp lực thời gian',
          examTarget: 'Tất cả',
          tip: 'Ghi ngay lỗi sai vào Sổ tay phục thù để không tái phạm.',
        },
        {
          dayOfWeek: 0,
          dayName: 'Chủ Nhật',
          subject: 'Tổng Kết & Tái Tạo Năng Lượng',
          timeSlot: '19:30 - 20:30',
          durationMinutes: 60,
          task: 'Xem lại sổ tay lỗi sai, dọn dẹp bàn học và chuẩn bị tinh thần tuần mới',
          examTarget: 'Tất cả',
          tip: 'Giấc ngủ ngon là chìa khóa vàng cho trí nhớ dài hạn!',
        },
      ],
      advice: 'Kỷ luật tự giác chính là chiếc cầu nối giữa mục tiêu và thành tựu của bạn!',
    });
  }
}
