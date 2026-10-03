import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
        🍅
      </div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">404 - Không Tìm Thấy Trang</h2>
      <p className="text-stone-600 text-sm max-w-md mb-6">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển về Không Gian Học Tập Sĩ Tử 2027.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md transition-all"
      >
        Quay lại Trang Chủ
      </Link>
    </div>
  );
}
