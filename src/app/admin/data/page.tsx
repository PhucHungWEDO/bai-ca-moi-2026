import { getAllHymns } from "@/lib/data";
import AdminForm from "@/components/AdminForm";

export const metadata = {
  title: "Admin Data - Bài Ca Mới 2026",
};

export default function AdminDataPage() {
  const hymns = getAllHymns();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 px-4 md:px-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light text-slate-900 mb-2">
          Quản lý <span className="font-medium">Dữ Liệu</span>
        </h1>
        <p className="text-slate-500 mb-8 max-w-xl">
          Trang nội bộ chỉnh sửa trực tiếp thông tin thuật toán cho Smart Vibe Playlist và Search Engine. 
          Lưu ý: Viết các cảm xúc (vibes) cách nhau bằng dấu phẩy.
        </p>
        
        <AdminForm initialData={hymns} />
      </div>
    </div>
  );
}
