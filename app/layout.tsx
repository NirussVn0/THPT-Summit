import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sĩ Tử 2027 - Đếm Ngược & Lập Lịch Ôn Thi',
  description: 'Bộ công cụ đếm ngược THPTQG 2027, V-ACT, HSA 2027, ghim nguyện vọng & ngành học mục tiêu, lập lịch học tập thông minh và widget phong cách pastel tối giản.',
  openGraph: {
    title: 'Sĩ Tử 2027 - Đếm Ngược & Lập Lịch Ôn Thi',
    description: 'Bộ công cụ đếm ngược THPTQG 2027, V-ACT, HSA 2027, ghim nguyện vọng & ngành học mục tiêu, lập lịch học tập thông minh và widget phong cách pastel tối giản.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sĩ Tử 2027 - Đếm Ngược & Lập Lịch Ôn Thi',
    description: 'Bộ công cụ đếm ngược THPTQG 2027, V-ACT, HSA 2027, ghim nguyện vọng & ngành học mục tiêu, lập lịch học tập thông minh và widget phong cách pastel tối giản.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased bg-[#FAF8F5] text-stone-800 selection:bg-rose-200 selection:text-rose-900 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
