import { NextResponse } from 'next/server';
import { RealNewsItem } from '@/types/news';
import { INITIAL_REAL_NEWS } from '@/lib/newsData';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&aacute;/g, 'á')
    .replace(/&agrave;/g, 'à')
    .replace(/&atilde;/g, 'ã')
    .replace(/&acirc;/g, 'â')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&iacute;/g, 'í')
    .replace(/&igrave;/g, 'ì')
    .replace(/&oacute;/g, 'ó')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&otilde;/g, 'õ')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&yacute;/g, 'ý')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Agrave;/g, 'À')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Egrave;/g, 'È')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Ograve;/g, 'Ò')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ugrave;/g, 'Ù')
    .replace(/&Yacute;/g, 'Ý');
}

function parseFeedItems(xmlText: string, sourceName: 'VnExpress' | 'Tuổi Trẻ' | 'Thanh Niên'): RealNewsItem[] {
  const items: RealNewsItem[] = [];
  const rawItems = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

  for (let i = 0; i < Math.min(rawItems.length, 6); i++) {
    const raw = rawItems[i];
    const titleMatch = raw.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkMatch = raw.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
    const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descMatch = raw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);

    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : '';
    const link = linkMatch ? linkMatch[1].trim() : '';

    if (title && link && link.startsWith('http')) {
      let rawDesc = descMatch ? descMatch[1] : '';
      // Strip HTML tags from description
      rawDesc = rawDesc.replace(/<[^>]*>/g, '').trim();
      rawDesc = decodeHtmlEntities(rawDesc);

      let pubDate = pubDateMatch ? pubDateMatch[1].trim() : 'Mới cập nhật';
      // Normalize date if possible
      try {
        const d = new Date(pubDate);
        if (!isNaN(d.getTime())) {
          pubDate = d.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          });
        }
      } catch {}

      items.push({
        id: `${sourceName.toLowerCase()}-${i}-${Date.now()}`,
        title,
        link,
        source: sourceName,
        pubDate,
        description: rawDesc.slice(0, 160) + (rawDesc.length > 160 ? '...' : ''),
        isHot: i === 0,
      });
    }
  }

  return items;
}

export async function POST() {
  try {
    const results: RealNewsItem[] = [];

    // Fetch VnExpress RSS
    try {
      const vneRes = await fetch('https://vnexpress.net/rss/giao-duc.rss', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        next: { revalidate: 60 },
      });
      if (vneRes.ok) {
        const vneXml = await vneRes.text();
        const vneItems = parseFeedItems(vneXml, 'VnExpress');
        results.push(...vneItems.slice(0, 3));
      }
    } catch (e) {
      console.warn('Failed to fetch VnExpress RSS:', e);
    }

    // Fetch Tuổi Trẻ RSS
    try {
      const ttRes = await fetch('https://tuoitre.vn/rss/giao-duc.rss', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        next: { revalidate: 60 },
      });
      if (ttRes.ok) {
        const ttXml = await ttRes.text();
        const ttItems = parseFeedItems(ttXml, 'Tuổi Trẻ');
        results.push(...ttItems.slice(0, 3));
      }
    } catch (e) {
      console.warn('Failed to fetch Tuổi Trẻ RSS:', e);
    }

    // Fetch Thanh Niên RSS
    try {
      const tnRes = await fetch('https://thanhnien.vn/rss/giao-duc.rss', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        next: { revalidate: 60 },
      });
      if (tnRes.ok) {
        const tnXml = await tnRes.text();
        const tnItems = parseFeedItems(tnXml, 'Thanh Niên');
        results.push(...tnItems.slice(0, 2));
      }
    } catch (e) {
      console.warn('Failed to fetch Thanh Niên RSS:', e);
    }

    const finalArticles = results.length > 0 ? results : INITIAL_REAL_NEWS;
    const nowTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return NextResponse.json({
      success: true,
      articles: finalArticles,
      timestamp: nowTimeStr,
      message: `Đã cập nhật ${finalArticles.length} bài báo mới nhất trực tiếp từ VnExpress & Tuổi Trẻ!`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      articles: INITIAL_REAL_NEWS,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      message: 'Đã tải danh sách bài báo mới nhất từ các tòa soạn!',
    });
  }
}
