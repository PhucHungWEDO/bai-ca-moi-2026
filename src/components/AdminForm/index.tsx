"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { saveHymnsData } from "@/lib/actions";
import { Loader2, Save, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface Hymn {
  id: string | number;
  hymn_number: string | number;
  title: string;
  duration_seconds: number;
  vibes: string[];
  keywords: string | string[];
  lyrics?: string;
}

interface AdminFormProps {
  initialData: Hymn[];
}

export default function AdminForm({ initialData }: AdminFormProps) {
  const [hymns, setHymns] = useState<Hymn[]>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(
        () => setStatus({ type: null, message: "" }),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleUpdate = useCallback(
    (index: number, field: string, value: string) => {
      setHymns((prev) => {
        const updated = [...prev];
        if (field === "id") {
          updated[index] = { ...updated[index], id: value };
        } else if (field === "duration_seconds") {
          updated[index] = {
            ...updated[index],
            duration_seconds:
              value === ""
                ? 0
                : parseInt(value, 10) || updated[index].duration_seconds,
          };
        } else if (field === "vibes") {
          updated[index] = {
            ...updated[index],
            vibes: value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v !== ""),
          };
        } else if (field === "keywords") {
          updated[index] = { ...updated[index], keywords: value };
        } else if (field === "lyrics") {
          updated[index] = { ...updated[index], lyrics: value };
        }
        return updated;
      });
      setIsDirty(true);
    },
    []
  );

  const handleSingleSave = async (index: number) => {
    const originalHymn = initialData[index];
    const currentHymn = hymns[index];

    setStatus({ type: null, message: "" });
    startTransition(async () => {
      try {
        const response = await fetch("/api/save-hymn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldId: originalHymn.id,
            updatedHymn: currentHymn,
          }),
        });

        const res = await response.json();
        if (res.success) {
          setStatus({
            type: "success",
            message: `Bài #${currentHymn.hymn_number} đã được lưu thành công!`,
          });
        } else {
          setStatus({ type: "error", message: `Lỗi: ${res.error}` });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: `Lỗi kết nối: ${err.message}` });
      }
    });
  };

  const handleSave = () => {
    if (
      !window.confirm(
        "Bạn chắc chắn muốn lưu? Thao tác này sẽ ghi đè dữ liệu hiện tại."
      )
    ) {
      return;
    }
    setStatus({ type: null, message: "" });
    startTransition(async () => {
      const res = await saveHymnsData(hymns);
      if (res.success) {
        setIsDirty(false);
        setStatus({
          type: "success",
          message: "Đã lưu thành công!",
        });
      } else {
        setStatus({ type: "error", message: `Lỗi: ${res.error}` });
      }
    });
  };

  const getKeywordsString = (keywords: string | string[]) => {
    if (Array.isArray(keywords)) return keywords.join(", ");
    return keywords || "";
  };

  return (
    <div className="relative">
      {isDirty && !isPending && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Bạn có thay đổi chưa được lưu.
        </div>
      )}

      {/* Sticky Action Bar */}
      <div className="sticky top-16 md:top-20 z-40 mb-6 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-slate-700">
            {hymns.length} bài hát
          </p>
          {status.type === "success" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              {status.message}
            </span>
          )}
          {status.type === "error" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {status.message}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu Hệ Thống
        </button>
      </div>

      {/* Card List */}
      <div className="space-y-3">
        {hymns.map((hymn, index) => {
          const isExpanded = expandedId === hymn.id;
          return (
            <div
              key={hymn.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Bài {hymn.hymn_number}
                    </span>
                    <h3 className="font-medium text-slate-900 mt-0.5 text-sm leading-snug">
                      {hymn.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleSingleSave(index)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all border border-indigo-100 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Lưu bài này
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Mã số (ID)
                    </label>
                    <input
                      type="text"
                      value={hymn.id}
                      onChange={(e) =>
                        handleUpdate(index, "id", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                      placeholder="001"
                    />
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-600 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Cẩn thận khi sửa ID vì nó ảnh hưởng đến tên file ảnh .webp tương ứng.
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Thời lượng (giây)
                    </label>
                    <input
                      type="number"
                      value={hymn.duration_seconds || ""}
                      onChange={(e) =>
                        handleUpdate(index, "duration_seconds", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Vibes (ngăn cách bởi dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={hymn.vibes?.join(", ") || ""}
                      onChange={(e) =>
                        handleUpdate(index, "vibes", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="vui, buồn, tạ ơn"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Từ khoá
                    </label>
                    <input
                      type="text"
                      value={getKeywordsString(hymn.keywords)}
                      onChange={(e) =>
                        handleUpdate(index, "keywords", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Thái độ, Tin Tưởng"
                    />
                  </div>
                </div>
              </div>

              {/* Lyrics Toggle */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : hymn.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>
                  {hymn.lyrics ? "✓ Có lời bài hát" : "Thêm lời bài hát"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Lyrics Textarea */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-100">
                  <textarea
                    value={hymn.lyrics || ""}
                    onChange={(e) =>
                      handleUpdate(index, "lyrics", e.target.value)
                    }
                    rows={10}
                    placeholder={"Nhập lời bài hát...\n\nVerse 1:\n...\n\nChorus:\n..."}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-y"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
