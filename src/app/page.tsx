import Link from "next/link";
import { Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extralight text-slate-900 tracking-tight">
          Bài Ca Mới <span className="font-semibold text-blue-600">2026</span>
        </h1>
        <p className="mt-4 text-slate-500 text-lg">
          Trải nghiệm tĩnh lặng. Tìm kiếm tức thì.
        </p>
      </div>

      <Link 
        href="/search"
        className="group flex flex-col items-center justify-center w-full max-w-sm aspect-square bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-3xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Search className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <h2 className="text-xl font-medium text-slate-900">Bắt đầu tìm kiếm</h2>
        <p className="text-slate-500 mt-2 text-sm text-center px-6">
          Nhập số thứ tự hoặc tên bài hát để mở hợp âm
        </p>
      </Link>
    </div>
  );
}
