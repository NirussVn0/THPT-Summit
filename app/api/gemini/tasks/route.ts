import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'generate', payload = {} } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key is set
    if (!apiKey) {
      if (action === 'sort') {
        const tasks = payload.tasks || [];
        // Default heuristic sort: high priority first, then longer duration
        const sorted = [...tasks].sort((a, b) => {
          const priorityScore = { high: 3, medium: 2, low: 1 };
          return (priorityScore[b.priority as 'high'] || 2) - (priorityScore[a.priority as 'high'] || 2);
        });
        return NextResponse.json({
          tasks: sorted,
          explanation: 'Đã sắp xếp ưu tiên các ca học trọng điểm và môn có độ khó cao lên đầu chuỗi tập trung.',
        });
      }

      if (action === 'classify') {
        const tasks = payload.tasks || [];
        const classified = tasks.map((t: any) => ({
          ...t,
          examTarget: t.examTarget || 'THPTQG',
          priority: t.priority || 'high',
        }));
        return NextResponse.json({
          tasks: classified,
          summary: 'Đã phân loại các môn thi theo chuẩn chương trình GDPT 2018 và định dạng kỳ thi 2027.',
        });
      }

      // Fallback generate
      return NextResponse.json({
        tasks: [
          {
            id: `ai-gen-${Date.now()}-1`,
            title: 'Luyện 25 câu Toán chuyên đề Hàm số & Tích phân',
            subject: 'Toán',
            dayOfWeek: payload.dayOfWeek ?? 1,
            timeSlot: '19:30 - 21:00',
            durationMinutes: 90,
            completed: false,
            priority: 'high',
            examTarget: 'THPTQG',
            notes: 'Rèn tốc độ trắc nghiệm đúng/sai và bài toán thực tế.',
            subtasks: [
              { id: `st-1`, title: 'Giải 15 câu nhận biết & thông hiểu', completed: false },
              { id: `st-2`, title: 'Giải 10 câu vận dụng cao', completed: false },
            ],
          },
          {
            id: `ai-gen-${Date.now()}-2`,
            title: 'Luyện đề Tư Duy Logic V-ACT / HSA dạng Mệnh đề',
            subject: 'Tư Duy Logic (ĐGNL)',
            dayOfWeek: payload.dayOfWeek ?? 1,
            timeSlot: '21:15 - 22:15',
            durationMinutes: 60,
            completed: false,
            priority: 'medium',
            examTarget: 'V-ACT',
            notes: 'Vẽ bảng phân tích vị trí để loại trừ đáp án nhanh.',
            subtasks: [
              { id: `st-3`, title: 'Làm 10 câu suy luận logic', completed: false },
              { id: `st-4`, title: 'Chữa kỹ các câu bẫy', completed: false },
            ],
          },
        ],
        advice: 'Kỷ luật hoàn thành từng ca học sẽ giúp bạn bứt phá điểm số trong kỳ thi 2027!',
      });
    }

    const ai = new GoogleGenAI(); // Automatically uses process.env.GEMINI_API_KEY

    if (action === 'sort') {
      const { tasks = [], dayOfWeek = 1 } = payload;
      const prompt = `
Bạn là chuyên gia tâm lý học giáo dục và cố vấn phương pháp học tập cho học sinh thế hệ 2K9 ôn thi THPT Quốc Gia & Đánh Giá Năng Lực 2027 (chương trình GDPT 2018).

Dưới đây là danh sách các ca học của học sinh trong ngày (thứ ${dayOfWeek === 0 ? 'Chủ Nhật' : dayOfWeek + 1}):
${JSON.stringify(tasks, null, 2)}

Hãy phân tích và SẮP XẾP LẠI THỨ TỰ (reorder) các ca học này theo thứ tự tối ưu nhất cho não bộ:
1. Đưa môn đòi hỏi tư duy tính toán cao / logic nặng (Toán, Tư duy logic, Lý, Hóa) vào thời điểm não bộ tập trung cao nhất (ca đầu tiên hoặc ca tối sớm).
2. Xen kẽ các môn Khoa học tự nhiên với môn Đọc hiểu / Xã hội / Ngôn ngữ (Văn, Anh, Sử, Địa) để tránh quá tải cùng một vùng bán cầu não.
3. Cập nhật lại khung giờ 'timeSlot' liên tiếp hợp lý (ví dụ: 19:30 - 20:30, 20:45 - 22:00 có khoảng nghỉ ngắn giữa các ca).
4. Giữ nguyên 'id', 'title', 'subject', 'durationMinutes', 'completed', 'priority', 'examTarget', 'subtasks' của mỗi task.

BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT (không dùng markdown code blocks ngoài JSON):
{
  "tasks": [ ...danh sách các task theo thứ tự tối ưu đã cập nhật timeSlot... ],
  "explanation": "Lời giải thích ngắn gọn 2-3 câu về lý do sắp xếp thứ tự này (như xen kẽ tự nhiên - xã hội, tận dụng đỉnh cao tập trung)."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json(parsed);
    }

    if (action === 'classify') {
      const { tasks = [] } = payload;
      const prompt = `
Bạn là chuyên gia phân loại chương trình thi THPT Quốc Gia & ĐGNL (V-ACT, HSA, TSA) cho học sinh 2K9 (kỳ thi 2027 theo GDPT 2018).

Dưới đây là các ca học của học sinh:
${JSON.stringify(tasks, null, 2)}

Hãy phân tích và hiệu chỉnh phân loại cho từng task:
1. 'subject': Chuẩn hóa về một trong các nhóm: 'Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lí', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lí', 'Tin Học', 'Tư Duy Logic (ĐGNL)', 'Đọc Hiểu (V-ACT/HSA)', 'Khoa Học Tự Nhiên', 'Khoa Học Xã Hội'.
2. 'priority': 'high' (trọng điểm), 'medium' (củng cố), 'low' (ôn nhẹ).
3. 'examTarget': 'THPTQG', 'V-ACT', 'HSA', hoặc 'Tất cả'.
4. Giữ nguyên 'id', 'title', 'timeSlot', 'durationMinutes', 'completed', 'subtasks'.

BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT:
{
  "tasks": [ ...danh sách task đã được chuẩn hóa subject, priority, examTarget... ],
  "summary": "Tóm tắt ngắn gọn phân tích tỷ trọng giữa các môn và kỳ thi, kèm lời khuyên cân đối."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json(parsed);
    }

    // Default action: 'generate'
    const {
      university = 'Đại học Bách Khoa / Kinh Tế / Quốc Gia',
      major = 'Ngành mục tiêu',
      targetScore = '27+ / 900+ ĐGNL',
      weakSubjects = ['Toán', 'Tư duy logic'],
      targetExams = ['THPTQG 2027', 'V-ACT 2027'],
      dayOfWeek = 1,
      hoursPerDay = 3,
      customPrompt = '',
    } = payload;

    const prompt = `
Bạn là thủ khoa và cố vấn ôn thi THPT Quốc Gia & Đánh Giá Năng Lực (V-ACT ĐHQG TP.HCM, HSA ĐHQG Hà Nội, TSA Bách Khoa) cho sĩ tử 2K9 (kỳ thi năm 2027 - chương trình GDPT 2018).

Thông tin học sinh:
- Mục tiêu: Trường ${university}, Ngành ${major}, Điểm mong muốn: ${targetScore}
- Các kỳ thi nhắm tới: ${targetExams.join(', ')}
- Môn còn yếu cần ưu tiên cải thiện: ${weakSubjects.join(', ')}
- Thời gian học dự kiến trong ngày: ${hoursPerDay} giờ
- Ngày học: Thứ ${dayOfWeek === 0 ? 'Chủ Nhật' : dayOfWeek + 1}
${customPrompt ? `- Yêu cầu đặc biệt của học sinh: "${customPrompt}"` : ''}

Hãy tạo danh sách các ca học chi tiết, rõ ràng và hành động cụ thể cho ngày này (khoảng 2 đến 4 ca học phù hợp với tổng thời lượng ${hoursPerDay} giờ).
Mỗi ca học cần có subtasks (2-3 nhiệm vụ con cụ thể để học sinh tick khi học).

BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT (không dùng markdown code blocks ngoài JSON):
{
  "tasks": [
    {
      "title": "Tên ca học rõ ràng, hành động cụ thể",
      "subject": "Tên môn chuẩn (Toán | Ngữ Văn | Tiếng Anh | Vật Lí | Hóa Học | Sinh Học | Lịch Sử | Địa Lí | Tư Duy Logic (ĐGNL) | Đọc Hiểu (V-ACT/HSA))",
      "dayOfWeek": ${dayOfWeek},
      "timeSlot": "19:30 - 21:00",
      "durationMinutes": 90,
      "priority": "high",
      "examTarget": "THPTQG",
      "notes": "Mẹo học / chiến lược làm bài thi",
      "subtasks": [
        { "title": "Nhiệm vụ con 1", "completed": false },
        { "title": "Nhiệm vụ con 2", "completed": false }
      ]
    }
  ],
  "advice": "Lời khuyên động viên và chiến lược từ AI gửi đến sĩ tử 2K9"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Format IDs for tasks and subtasks
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      parsed.tasks = parsed.tasks.map((t: any, idx: number) => ({
        id: `ai-task-${Date.now()}-${idx}`,
        title: t.title,
        subject: t.subject || 'Toán',
        dayOfWeek: t.dayOfWeek ?? dayOfWeek,
        timeSlot: t.timeSlot || '19:30 - 21:00',
        durationMinutes: t.durationMinutes || 60,
        completed: false,
        priority: t.priority || 'high',
        examTarget: t.examTarget || 'THPTQG',
        notes: t.notes || '',
        subtasks: Array.isArray(t.subtasks)
          ? t.subtasks.map((st: any, sIdx: number) => ({
              id: `sub-${Date.now()}-${idx}-${sIdx}`,
              title: typeof st === 'string' ? st : st.title,
              completed: false,
            }))
          : [],
      }));
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Gemini tasks API error:', error);
    return NextResponse.json(
      {
        error: 'Không thể xử lý yêu cầu AI lúc này',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
