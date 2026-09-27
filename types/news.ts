export type PressOutlet = 'all' | 'VnExpress' | 'Tuổi Trẻ' | 'Thanh Niên';

export interface RealNewsItem {
  id: string;
  title: string;
  link: string;
  source: 'VnExpress' | 'Tuổi Trẻ' | 'Thanh Niên';
  pubDate: string;
  description?: string;
  isHot?: boolean;
}

// Backward compatibility alias
export type NewsArticle = RealNewsItem;
