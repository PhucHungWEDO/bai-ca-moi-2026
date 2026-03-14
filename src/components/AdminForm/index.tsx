"use client";

import { useState, useTransition } from "react";
import { saveHymnsData } from "@/lib/actions";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminFormProps {
  initialData: any[]; // Using any to avoid strict TS tying to backend exact fields if changed, but it strictly mirrors JSON
}

export default function AdminForm({ initialData }: AdminFormProps) {
  const [hymns, setHymns] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

  const handleUpdate = (index: number, field: string, value: string) => {
    const newHymns = [...hymns];
    if (field === "duration_seconds") {
      newHymns[index].duration_seconds = parseInt(value, 10) || 0;
    } else if (field === "vibes") {
      // Allow user to write trailing commas naturally, only filter spaces
      newHymns[index].vibes = value.split(",").map((v) => v.trim()).filter((v) => v !== "");
    } else if (field === "keywords") {
      newHymns[index].keywords = value;
    }
    setHymns(newHymns);
  };

  const handleSave = () => {
    setStatus({ type: null, message: "" });
    startTransition(async () => {
      const res = await saveHymnsData(hymns);
      if (res.success) {
        setStatus({ type: 'success', message: "Đã lưu bản sao lưu mới vào hệ thống!" });
        setTimeout(() => setStatus({ type: null, message: "" }), 4000);
      } else {
        setStatus({ type: 'error', message: `Lỗi: ${res.error}` });
      }
    });
  };

  return (
    <div className="relative">
      {/* Sticky Action Bar */}
      <div className="sticky top-16 md:top-20 z-40 mb-6 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-slate-700 hidden sm:block">
            Đang chỉnh sửa: {hymns.length} bài hát
          </p>
          {status.type === 'success' && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              {status.message}
            </span>
          )}
          {status.type === 'error' && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              {status.message}
            </span>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 shadow-sm"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu Hệ Thống
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4 pl-6 whitespace-nowrap hidden md:table-cell">Số</th>
                <th className="p-4 min-w-[200px]">Tên Bài Hát</th>
                <th className="p-4 min-w-[120px]">Thời lượng (s)</th>
                <th className="p-4 min-w-[250px]">Vibes (ngăn cách bởi dấu phẩy)</th>
                <th className="p-4 pr-6 min-w-[200px]">Từ khoá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {hymns.map((hymn, index) => (
                <tr key={hymn.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 text-slate-400 font-medium hidden md:table-cell">
                    {hymn.hymn_number}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{hymn.title}</div>
                    <div className="text-xs text-slate-400 mt-1 md:hidden">Bài {hymn.hymn_number}</div>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={hymn.duration_seconds || ""}
                      onChange={(e) => handleUpdate(index, "duration_seconds", e.target.value)}
                      className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="text"
                      value={hymn.vibes?.join(", ") || ""}
                      onChange={(e) => handleUpdate(index, "vibes", e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="vui, buồn, tạ ơn"
                    />
                  </td>
                  <td className="p-4 pr-6">
                    <input
                      type="text"
                      value={hymn.keywords || ""}
                      onChange={(e) => handleUpdate(index, "keywords", e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Thái độ, Tin Tưởng"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
