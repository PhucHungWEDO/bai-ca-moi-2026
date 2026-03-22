"use client";

import { useState, useMemo, useEffect } from "react";
import { Search as SearchIcon, X, Music } from "lucide-react";

interface Hymn {
  id: string;
  hymn_number: string;
  title: string;
  category: string;
  image_url: string;
  keywords: string[];
  vibes: string[];
  duration_seconds: number;
  lyrics?: string;
}

function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [hymns, setHymns] = useState<Hymn[]>([]);

  useEffect(() => {
    fetch("/api/hymns")
      .then((r) => r.json())
      .then(setHymns)
      .catch(console.error);
  }, []);

  const results = useMemo(() => {
    if (!query) return hymns;
    const q = removeAccents(query.toLowerCase().trim());
    return hymns.filter((hymn) => {
      const keywordsMatch = hymn.keywords.some((kw) =>
        removeAccents(kw).includes(q)
      );
      const lyricsMatch = hymn.lyrics
        ? removeAccents(hymn.lyrics).includes(q)
        : false;
      return (
        removeAccents(hymn.title).includes(q) ||
        hymn.hymn_number.toLowerCase().includes(q) ||
        keywordsMatch ||
        lyricsMatch
      );
    });
  }, [query, hymns]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] md:min-h-[calc(100vh-theme(spacing.16))]">
      {/* Search Input Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-4 py-4 border-b border-slate-100">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl leading-5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-lg transition-all"
            placeholder="Tìm theo tên bài hát, số thứ tự..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        <p className="text-xs text-slate-400 mb-3 px-1">
          {hymns.length === 0
            ? "Đang tải..."
            : query
            ? `${results.length} kết quả cho "${query}"`
            : `Tất cả ${results.length} bài hát`}
        </p>

        {hymns.length > 0 && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-900 font-medium text-lg">Không tìm thấy bài hát</p>
            <p className="text-slate-500 mt-2 text-sm">Thử từ khoá hoặc số thứ tự khác.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {results.map((hymn, index) => (
              <a
                key={hymn.id}
                href={`/viewer/${hymn.id}`}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                  index !== results.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                  {hymn.image_url ? (
                    <img
                      src={hymn.image_url}
                      alt={hymn.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {hymn.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bài {hymn.hymn_number}
                    {hymn.category ? ` · ${hymn.category}` : ""}
                  </p>
                </div>

                <span className="text-slate-300 text-lg flex-shrink-0">›</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
