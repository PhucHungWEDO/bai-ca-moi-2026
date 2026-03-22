"use client";

// File: src/components/LyricsForm/index.tsx

import { useState, useTransition, useEffect } from "react";
import { Loader2, Save, CheckCircle, AlertTriangle } from "lucide-react";

interface Hymn {
  id: string | number;
  hymn_number: string | number;
  title: string;
  lyrics?: string;
}

export default function LyricsForm({ hymn }: { hymn: Hymn }) {
  const [lyrics, setLyrics] = useState(hymn.lyrics || "");
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Warn before leaving with unsaved changes
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

  // Auto-clear status
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(
        () => setStatus({ type: null, message: "" }),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSave = () => {
    setStatus({ type: null, message: "" });
    startTransition(async () => {
      try {
        const response = await fetch("/api/save-hymn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldId: hymn.id,
            updatedHymn: { lyrics }
          }),
        });

        const res = await response.json();
        
        if (res.success) {
          setIsDirty(false);
          setStatus({ type: "success", message: "Đã lưu lời bài hát!" });
        } else {
          setStatus({ type: "error", message: `Lỗi: ${res.error}` });
        }
      } catch (err: any) {
        setStatus({ type: "error", message: `Lỗi kết nối: ${err.message}` });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Unsaved warning */}
      {isDirty && !isPending && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Bạn có thay đổi chưa được lưu.
        </div>
      )}

      {/* Textarea */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <textarea
          value={lyrics}
          onChange={(e) => {
            setLyrics(e.target.value);
            setIsDirty(true);
          }}
          rows={24}
          placeholder={"Nhập lời bài hát...\n\nVerse 1:\n...\n\nChorus:\n..."}
          className="w-full px-6 py-5 text-sm text-slate-800 leading-relaxed resize-none outline-none font-mono placeholder-slate-300"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div>
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
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu lời bài hát
        </button>
      </div>
    </div>
  );
}
