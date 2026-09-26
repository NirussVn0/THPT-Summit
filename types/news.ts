export type NewsCategory = 'all' | 'thpt' | 'dgnl' | 'tuyen-sinh' | 'cam-nang';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: 'thpt' | 'dgnl' | 'tuyen-sinh' | 'cam-nang';
  categoryLabel: string;
  source: string;
  publishedAt: string;
  readTimeMinutes: number;
  important?: boolean;
  isHot?: boolean;
  tags: string[];
  icon: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    accent: string;
  };
  content: {
    lead: string;
    paragraphs: string[];
    keyTakeaways: string[];
    officialAdvice?: string;
  };
}
