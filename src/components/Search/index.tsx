"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon, X, Music } from "lucide-react";
import { searchHymns } from "@/lib/data";

export default function Search() {
  const [query, setQuery] = useState("");
  
  const results = useMemo(() => searchHymns(query), [query]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] md:min-h-[calc(100vh-theme(spacing.16))]">
      {/* Search Input Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl leading-5 flex-1 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-lg transition-all"
            placeholder="Tìm theo tên bài hát, số thứ tự..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        <p className="text-sm text-slate-500 mb-6">
          {query ? `Tìm thấy ${results.length} kết quả` : `Tất cả bài hát (${results.length})`}
        </p>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-900 font-medium text-lg">Không tìm thấy bài hát</p>
            <p className="text-slate-500 mt-2">Vui lòng thử từ khóa hoặc số thứ tự khác.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((hymn) => (
              <a
                key={hymn.id}
                href={`/viewer/${hymn.id}`}
                className="group flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                  {hymn.image_url ? (
                    <img
                      src={hymn.image_url}
                      alt={hymn.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-xs font-semibold text-slate-500 mb-1 tracking-wider uppercase">
                    Bài {hymn.hymn_number}
                  </span>
                  <h3 className="font-medium text-slate-900 text-lg leading-tight truncate group-hover:text-blue-600 transition-colors">
                    {hymn.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {hymn.category}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
