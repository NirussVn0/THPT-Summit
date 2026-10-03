import { StudyTask, SubjectTag, SubTaskItem } from '@/types/exam';

export interface ParseResult {
  tasks: StudyTask[];
  advice: string;
}

// Check if input looks like a markdown todo list or raw bullet notes
export function isMarkdownTodoList(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return (
    /(-|\*|\+)\s*\[\s*[xX ]?\s*\]/m.test(text) ||
    /(-|\*|\+)\s+[a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/m.test(text) ||
    (text.includes('\n') && (text.includes('---') || /\b(\d+)\s*(p|’|'|phút|min)\b/i.test(text)))
  );
}

// Detect subject from line text and context
export function detectSubject(text: string, parentContext = ''): SubjectTag {
  const lineLower = text.toLowerCase();
  const contextLower = parentContext.toLowerCase();

  // 1. Direct line checks take highest priority
  if (/\b(c\.nghệ|công nghệ|cntt|code|lập trình|python|pascal|tin học)\b/i.test(lineLower)) {
    return 'Tin Học';
  }
  if (/\b(văn|ngữ văn|nghị luận|đoạn văn|thơ|văn học)\b/i.test(lineLower) && !/\b(tiếng anh|anh)\b/i.test(lineLower)) {
    return 'Ngữ Văn';
  }
  if (/\b(hình\b|hình học|câu hình|oxyz|toán|math|đại số|tích phân|đạo hàm|hàm số|nhị diện|vecto|vectơ)\b/i.test(lineLower)) {
    return 'Toán';
  }
  if (/\b(anh|english|vocab|reading|grammar|a an the|past|c1|ielts|toeic|từ vựng)\b/i.test(lineLower)) {
    return 'Tiếng Anh';
  }
  if (/\b(vact|v-act|logic|hsa|tsa|đgnl|tư duy logic|mệnh đề|suy luận)\b/i.test(lineLower)) {
    return 'Tư Duy Logic (ĐGNL)';
  }
  if (/\b(lý|vật lí|vật lý|dao động|sóng|điện xoay chiều)\b/i.test(lineLower)) {
    return 'Vật Lí';
  }
  if (/\b(hóa|hóa học|hữu cơ|vô cơ|este|dung dịch)\b/i.test(lineLower)) {
    return 'Hóa Học';
  }
  if (/\b(sinh|sinh học|di truyền|sinh thái|tế bào)\b/i.test(lineLower)) {
    return 'Sinh Học';
  }
  if (/\b(sử|lịch sử|kháng chiến|thế giới)\b/i.test(lineLower)) {
    return 'Lịch Sử';
  }
  if (/\b(địa|địa lí|địa lý|kinh tế|khí hậu)\b/i.test(lineLower)) {
    return 'Địa Lí';
  }

  // 2. Fallback to parent context
  if (/\b(toán|math|hình)\b/i.test(contextLower)) return 'Toán';
  if (/\b(anh|english)\b/i.test(contextLower)) return 'Tiếng Anh';
  if (/\b(văn)\b/i.test(contextLower)) return 'Ngữ Văn';
  if (/\b(tin|code)\b/i.test(contextLower)) return 'Tin Học';
  if (/\b(lý)\b/i.test(contextLower)) return 'Vật Lí';
  if (/\b(hóa)\b/i.test(contextLower)) return 'Hóa Học';
  if (/\b(sinh)\b/i.test(contextLower)) return 'Sinh Học';
  if (/\b(sử)\b/i.test(contextLower)) return 'Lịch Sử';
  if (/\b(địa)\b/i.test(contextLower)) return 'Địa Lí';

  return 'Toán';
}

// Detect exam target
export function detectExamTarget(text: string): 'THPTQG' | 'V-ACT' | 'HSA' | 'Tất cả' {
  const lower = text.toLowerCase();
  if (/v-?act/i.test(lower)) return 'V-ACT';
  if (/hsa/i.test(lower)) return 'HSA';
  if (/tsa|đgnl/i.test(lower)) return 'V-ACT';
  if (/c1|ielts/i.test(lower)) return 'V-ACT';
  if (/gk1|giữa kỳ|thpt|thptqg|đại học/i.test(lower)) return 'THPTQG';
  return 'THPTQG';
}

// Extract duration in minutes from string: e.g. "(50’)", "15'", "25’", "1.5h"
export function extractDuration(text: string, defaultDuration = 45): { duration: number; cleanedText: string } {
  let cleaned = text;
  let duration = defaultDuration;

  // Pattern 1: e.g. (50’) or (50') or (50p) or (50 phút)
  const parenMatch = cleaned.match(/\(\s*(\d+(?:\.\d+)?)\s*(?:’|'|p|phút|min|m|h|giờ)?\s*\)/i);
  if (parenMatch) {
    let num = parseFloat(parenMatch[1]);
    if (parenMatch[0].toLowerCase().includes('h') || parenMatch[0].toLowerCase().includes('giờ')) {
      num = num * 60;
    }
    duration = Math.max(10, Math.min(240, Math.round(num)));
    cleaned = cleaned.replace(parenMatch[0], '').trim();
    return { duration, cleanedText: cleaned.replace(/\s{2,}/g, ' ') };
  }

  // Pattern 2: e.g. "25’" or "15'" or "50p" or "1.5h" anywhere in text
  const match = cleaned.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:’|'|p|phút|min|h|giờ)(?:$|\s|[.,;:!])/i);
  if (match) {
    let num = parseFloat(match[1]);
    if (match[0].toLowerCase().includes('h') || match[0].toLowerCase().includes('giờ')) {
      num = num * 60;
    }
    duration = Math.max(10, Math.min(240, Math.round(num)));
    cleaned = cleaned.replace(match[0], ' ').trim();
    return { duration, cleanedText: cleaned.replace(/\s{2,}/g, ' ') };
  }

  return { duration, cleanedText: cleaned.replace(/\s{2,}/g, ' ') };
}

// Clean markdown prefixes from line
export function cleanLine(line: string): { text: string; indent: number; isBullet: boolean } {
  const matchIndent = line.match(/^(\s*)/);
  const indent = matchIndent ? matchIndent[1].replace(/\t/g, '    ').length : 0;

  let text = line.trim();
  let isBullet = false;

  // Remove checkboxes e.g. - [ ], - [x], * [ ]
  if (/^[-*+]\s*\[\s*[xX ]?\s*\]\s*/.test(text)) {
    text = text.replace(/^[-*+]\s*\[\s*[xX ]?\s*\]\s*/, '');
    isBullet = true;
  } else if (/^[-*+]\s+/.test(text)) {
    text = text.replace(/^[-*+]\s+/, '');
    isBullet = true;
  } else if (/^\d+[.)]\s+/.test(text)) {
    text = text.replace(/^\d+[.)]\s+/, '');
    isBullet = true;
  }

  return { text: text.trim(), indent, isBullet };
}

export function parseRawMarkdownTasks(rawText: string, defaultDayOfWeek = 1): ParseResult {
  if (!rawText || !rawText.trim()) {
    return { tasks: [], advice: '' };
  }

  const lines = rawText.split('\n');
  const parsedTasks: StudyTask[] = [];

  let currentCategory = '';
  let activeTask: StudyTask | null = null;
  let activeTaskIndent = 0;

  // Time slot generator starting at 19:30
  let currentStartMinutes = 19 * 60 + 30;
  function getNextTimeSlot(duration: number): string {
    const startH = Math.floor(currentStartMinutes / 60) % 24;
    const startM = currentStartMinutes % 60;
    const endMinutes = currentStartMinutes + duration;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;

    // Next task starts with 10 min break
    currentStartMinutes = endMinutes + 10;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(startH)}:${pad(startM)} - ${pad(endH)}:${pad(endM)}`;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    // Check divider lines like --- or ===
    if (/^(\s*[-=_*~]{3,}\s*)$/.test(rawLine)) {
      if (activeTask) {
        parsedTasks.push(activeTask);
        activeTask = null;
      }
      currentCategory = '';
      continue;
    }

    const { text, indent, isBullet } = cleanLine(rawLine);
    if (!text) continue;

    // Check if this line is a section or category header:
    // e.g. "toán", "ANH", "luyện thêm"
    const isHeaderLine =
      indent <= 2 &&
      text.length <= 25 &&
      !text.includes('(') &&
      !/\d+\s*(p|’|'|phút)/.test(text) &&
      /^(toán|anh|văn|lý|hóa|sinh|sử|địa|tin|luyện thêm|ôn tập|môn|buổi)/i.test(text);

    if (isHeaderLine) {
      if (activeTask) {
        parsedTasks.push(activeTask);
        activeTask = null;
      }
      currentCategory = text.replace(/[:：]$/, '').trim();
      continue;
    }

    // Check if this line is a subtask under the activeTask:
    // It's a subtask if indented strictly more than the activeTask AND does not specify its own standalone duration
    const hasOwnDuration = /\(\s*\d+\s*(?:’|'|p|phút)?\s*\)/i.test(text) || /^\d+\s*(?:’|'|p|phút)/i.test(text);

    if (activeTask && indent > activeTaskIndent && !hasOwnDuration) {
      const { cleanedText } = extractDuration(text);
      if (!activeTask.subtasks) activeTask.subtasks = [];
      activeTask.subtasks.push({
        id: `st-${Date.now()}-${activeTask.subtasks.length + 1}`,
        title: cleanedText || text,
        completed: false,
      });
      continue;
    }

    // Otherwise, this line is a new Task!
    if (activeTask) {
      parsedTasks.push(activeTask);
      activeTask = null;
    }

    const { duration, cleanedText } = extractDuration(text);
    const subject = detectSubject(cleanedText || text, currentCategory);
    const examTarget = detectExamTarget(cleanedText || text);

    // Format clean title
    let title = (cleanedText || text).trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // If title is short (e.g. "Oxyz" or "Đề 1-2"), prefix with subject context if not present
    if (title.length <= 10 && currentCategory && !title.toLowerCase().includes(currentCategory.toLowerCase())) {
      title = `${currentCategory.toUpperCase()}: ${title}`;
    }

    activeTask = {
      id: `task-parsed-${Date.now()}-${parsedTasks.length + 1}`,
      title,
      subject,
      dayOfWeek: defaultDayOfWeek,
      timeSlot: getNextTimeSlot(duration),
      durationMinutes: duration,
      completed: false,
      priority: duration >= 50 || examTarget !== 'THPTQG' ? 'high' : 'medium',
      examTarget,
      notes: currentCategory ? `Phần: ${currentCategory}` : 'Trích xuất tự động từ danh sách ghi chú',
      subtasks: [],
    };
    activeTaskIndent = indent;
  }

  if (activeTask) {
    parsedTasks.push(activeTask);
  }

  return {
    tasks: parsedTasks,
    advice: `Đã tự động trích xuất và tối ưu hóa ${parsedTasks.length} ca học chi tiết từ danh sách ghi chú của bạn. Hãy kiên trì bấm giờ hoàn thành từng ca để tích lũy điểm số vững chắc!`,
  };
}
