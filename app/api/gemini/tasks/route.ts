import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { parseRawMarkdownTasks, isMarkdownTodoList } from '@/lib/markdownTodoParser';

function extractJsonFromText(text: string | null): any {
  if (!text) return null;

  // 1. Try direct cleaned JSON
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 2. Try substring from first { to last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  // 3. Try substring from first [ to last ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return { tasks: JSON.parse(text.substring(firstBracket, lastBracket + 1)) };
    } catch {}
  }

  return null;
}

async function callGeminiSafe(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    return res.text || null;
  } catch (err) {
    console.warn('Gemini 3.1-flash-lite call error, trying fallback to gemini-flash-latest:', err);
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });
      return res.text || null;
    } catch (fallbackErr) {
      console.error('All Gemini model calls failed:', fallbackErr);
      return null;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'generate', payload = {} } = body;

    // ========================================================
    // ACTION 1: SORT TASKS
    // ========================================================
    if (action === 'sort') {
      const { tasks = [], dayOfWeek = 1 } = payload;

      const fallbackSorted = [...tasks].sort((a, b) => {
        const priorityScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (priorityScore[b.priority] || 2) - (priorityScore[a.priority] || 2);
      });

      const prompt = `
Bạn là chuyên gia tâm lý học giáo dục và cố vấn phương pháp học tập cho học sinh thế hệ 2K9 ôn thi THPT Quốc Gia & Đánh Giá Năng Lực 2027 (chương trình GDPT 2018).

Dưới đây là danh sách các ca học của học sinh trong ngày (thứ ${dayOfWeek === 0 ? 'Chủ Nhật' : dayOfWeek + 1}):
${JSON.stringify(tasks, null, 2)}

Hãy phân tích và SẮP XẾP LẠI THỨ TỰ (reorder) các ca học này theo thứ tự tối ưu nhất cho não bộ:
1. Đưa môn đòi hỏi tư duy tính toán cao / logic nặng (Toán, Tư duy logic, Lý, Hóa) vào thời điểm não bộ tập trung cao nhất (ca đầu tiên hoặc ca tối sớm).
2. Xen kẽ các môn Khoa học tự nhiên với môn Đọc hiểu / Xã hội / Ngôn ngữ (Văn, Anh, Sử, Địa) để tránh quá tải cùng một vùng bán cầu não.
3. Cập nhật lại khung giờ 'timeSlot' liên tiếp hợp lý (ví dụ: 19:30 - 20:30, 20:45 - 22:00 có khoảng nghỉ ngắn giữa các ca).
4. Giữ nguyên 'id', 'title', 'subject', 'durationMinutes', 'completed', 'priority', 'examTarget', 'subtasks' của mỗi task.

BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT:
{
  "tasks": [ ...danh sách các task theo thứ tự tối ưu đã cập nhật timeSlot... ],
  "explanation": "Lời giải thích ngắn gọn 2-3 câu về lý do sắp xếp thứ tự này."
}
`;

      const aiText = await callGeminiSafe(prompt);
      const parsed = extractJsonFromText(aiText);

      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        return NextResponse.json(parsed);
      }

      return NextResponse.json({
        tasks: fallbackSorted,
        explanation: 'Đã sắp xếp ưu tiên các ca học trọng điểm và môn có độ khó cao lên đầu chuỗi tập trung.',
      });
    }

    // ========================================================
    // ACTION 2: CLASSIFY TASKS
    // ========================================================
    if (action === 'classify') {
      const { tasks = [] } = payload;

      const fallbackClassified = tasks.map((t: any) => ({
        ...t,
        examTarget: t.examTarget || 'THPTQG',
        priority: t.priority || 'high',
      }));

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

      const aiText = await callGeminiSafe(prompt);
      const parsed = extractJsonFromText(aiText);

      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        return NextResponse.json(parsed);
      }

      return NextResponse.json({
        tasks: fallbackClassified,
        summary: 'Đã phân loại các môn thi theo chuẩn chương trình GDPT 2018 và định dạng kỳ thi 2027.',
      });
    }

    // ========================================================
    // ACTION 3: GENERATE / PARSE TASKS
    // ========================================================
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

    const rawInput = (customPrompt || '').trim();

    // Check if the user input is a raw Markdown Checklist / Todo List:
    // e.g. "- [ ] toán \n - [ ] đề 1-2 (50’) \n - [ ] oxyz (50’)"
    if (isMarkdownTodoList(rawInput)) {
      const localResult = parseRawMarkdownTasks(rawInput, dayOfWeek);

      // Attempt AI refinement if API is responsive
      const prompt = `
Bạn là trợ lý học tập thông minh cho sĩ tử 2K9 (kỳ thi THPTQG & ĐGNL 2027).
Dưới đây là danh sách to-do / ghi chú dạng Markdown của học sinh:
\`\`\`
${rawInput}
\`\`\`

Hãy phân tích và chuyển đổi thành danh sách các ca học chi tiết có cấu trúc chuẩn cho Thứ ${dayOfWeek === 0 ? 'Chủ Nhật' : dayOfWeek + 1}:
1. Nhận diện chuẩn môn học ('Toán', 'Tiếng Anh', 'Ngữ Văn', 'Tin Học', 'Vật Lí', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lí', 'Tư Duy Logic (ĐGNL)').
2. Tách đúng thời lượng (ví dụ 50' -> 50 phút, 15' -> 15 phút, 25' -> 25 phút).
3. Đặt 'timeSlot' liên tiếp từ 19:30 có 10 phút nghỉ giữa các ca.
4. Trích xuất các gạch đầu dòng con làm 'subtasks' (mỗi subtask có { "title": "...", "completed": false }).
5. Gán 'priority' ('high', 'medium', 'low') và 'examTarget' ('THPTQG', 'V-ACT', 'HSA', 'Tất cả').

BẮT BUỘC TRẢ VỀ JSON:
{
  "tasks": [
    {
      "title": "Tên ca học rõ ràng, chi tiết",
      "subject": "Tên môn",
      "dayOfWeek": ${dayOfWeek},
      "timeSlot": "19:30 - 20:20",
      "durationMinutes": 50,
      "priority": "high",
      "examTarget": "THPTQG",
      "notes": "Ghi chú chiến lược",
      "subtasks": [
        { "title": "Nhiệm vụ con", "completed": false }
      ]
    }
  ],
  "advice": "Lời khuyên động viên và chiến lược từ AI gửi đến sĩ tử 2K9"
}
`;

      const aiText = await callGeminiSafe(prompt);
      const parsed = extractJsonFromText(aiText);

      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        parsed.tasks = parsed.tasks.map((t: any, idx: number) => ({
          id: `ai-task-${Date.now()}-${idx}`,
          title: t.title,
          subject: t.subject || 'Toán',
          dayOfWeek: t.dayOfWeek ?? dayOfWeek,
          timeSlot: t.timeSlot || '19:30 - 21:00',
          durationMinutes: t.durationMinutes || 45,
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
        return NextResponse.json(parsed);
      }

      // If AI call failed, return the high-fidelity local parsed result
      return NextResponse.json({
        tasks: localResult.tasks,
        advice: localResult.advice,
      });
    }

    // Standard AI generation prompt
    const prompt = `
Bạn là thủ khoa và cố vấn ôn thi THPT Quốc Gia & Đánh Giá Năng Lực (V-ACT ĐHQG TP.HCM, HSA ĐHQG Hà Nội, TSA Bách Khoa) cho sĩ tử 2K9 (kỳ thi năm 2027 - chương trình GDPT 2018).

Thông tin học sinh:
- Mục tiêu: Trường ${university}, Ngành ${major}, Điểm mong muốn: ${targetScore}
- Các kỳ thi nhắm tới: ${Array.isArray(targetExams) ? targetExams.join(', ') : targetExams}
- Môn còn yếu cần ưu tiên cải thiện: ${Array.isArray(weakSubjects) ? weakSubjects.join(', ') : weakSubjects}
- Thời gian học dự kiến trong ngày: ${hoursPerDay} giờ
- Ngày học: Thứ ${dayOfWeek === 0 ? 'Chủ Nhật' : dayOfWeek + 1}
${rawInput ? `- Yêu cầu đặc biệt của học sinh: "${rawInput}"` : ''}

Hãy tạo danh sách các ca học chi tiết, rõ ràng và hành động cụ thể cho ngày này (khoảng 2 đến 4 ca học phù hợp với tổng thời lượng ${hoursPerDay} giờ).
Mỗi ca học cần có subtasks (2-3 nhiệm vụ con cụ thể để học sinh tick khi học).

BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT:
{
  "tasks": [
    {
      "title": "Tên ca học rõ ràng, hành động cụ thể",
      "subject": "Tên môn chuẩn (Toán | Ngữ Văn | Tiếng Anh | Vật Lí | Hóa Học | Sinh Học | Lịch Sử | Địa Lí | Tin Học | Tư Duy Logic (ĐGNL) | Đọc Hiểu (V-ACT/HSA))",
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

    const aiText = await callGeminiSafe(prompt);
    const parsed = extractJsonFromText(aiText);

    if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
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
      return NextResponse.json(parsed);
    }

    // Default Fallback ca học 2K9
    const defaultFallbackTasks = [
      {
        id: `ai-gen-${Date.now()}-1`,
        title: 'Luyện 25 câu Toán chuyên đề Hình học Không gian & Tích phân',
        subject: 'Toán',
        dayOfWeek,
        timeSlot: '19:30 - 21:00',
        durationMinutes: 90,
        completed: false,
        priority: 'high',
        examTarget: 'THPTQG',
        notes: 'Rèn tốc độ trắc nghiệm đúng/sai và bài toán thực tế GDPT 2018.',
        subtasks: [
          { id: `st-1`, title: 'Giải 15 câu nhận biết & thông hiểu', completed: false },
          { id: `st-2`, title: 'Giải 10 câu vận dụng cao', completed: false },
        ],
      },
      {
        id: `ai-gen-${Date.now()}-2`,
        title: 'Luyện đề Tư Duy Logic V-ACT / HSA dạng Mệnh đề & Vị trí',
        subject: 'Tư Duy Logic (ĐGNL)',
        dayOfWeek,
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
      {
        id: `ai-gen-${Date.now()}-3`,
        title: 'Đọc hiểu Tiếng Anh & Trau dồi 20 từ vựng học thuật',
        subject: 'Tiếng Anh',
        dayOfWeek,
        timeSlot: '22:25 - 23:00',
        durationMinutes: 35,
        completed: false,
        priority: 'medium',
        examTarget: 'THPTQG',
        notes: 'Ghi chú collocation vào flashcard.',
        subtasks: [
          { id: `st-5`, title: 'Đọc 1 bài đọc dài và dịch câu khó', completed: false },
        ],
      },
    ];

    return NextResponse.json({
      tasks: defaultFallbackTasks,
      advice: 'Kỷ luật hoàn thành từng ca học sẽ giúp bạn bứt phá điểm số trong kỳ thi 2027!',
    });
  } catch (error) {
    console.error('Gemini tasks API caught error:', error);
    // Return a safe 200 JSON response so the client never crashes with "Unexpected token I"
    return NextResponse.json({
      tasks: [
        {
          id: `ai-gen-${Date.now()}-1`,
          title: 'Ca học củng cố kiến thức trọng điểm 2K9',
          subject: 'Toán',
          dayOfWeek: 1,
          timeSlot: '19:30 - 20:30',
          durationMinutes: 60,
          completed: false,
          priority: 'high',
          examTarget: 'THPTQG',
          notes: 'Tập trung ôn tập theo chương trình GDPT 2018.',
          subtasks: [
            { id: 'st-1', title: 'Hoàn thành bài tập tự luận / trắc nghiệm', completed: false },
          ],
        },
      ],
      advice: 'Hãy kiên trì theo đuổi kế hoạch học tập mỗi ngày!',
    });
  }
}
