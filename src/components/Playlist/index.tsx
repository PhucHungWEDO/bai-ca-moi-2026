"use client";

import { useState, useMemo, useEffect } from "react";
import { generateVibePlaylist, getAllAvailableVibes } from "@/lib/playlist";
import type { Hymn, PlaylistResult } from "@/lib/playlist";
import { Play, Sparkles, RefreshCw, X, ChevronRight, Music, Plus, Minus, Search as SearchIcon, ListMusic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function useHymns() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  useEffect(() => {
    fetch("/api/hymns")
      .then((r) => r.json())
      .then(setHymns)
      .catch(console.error);
  }, []);
  return hymns;
}

function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function PlaylistContainer() {
  const [activeTab, setActiveTab] = useState<"smart" | "manual">("smart");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 relative pb-28 md:pb-20">
      <div className="max-w-3xl mx-auto w-full px-4 flex-1 flex flex-col">
        {/* Header & Tabs */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-500">
            {activeTab === "smart" ? <Sparkles className="w-8 h-8" /> : <ListMusic className="w-8 h-8" />}
          </div>
          <h2 className="text-3xl font-light text-slate-900 tracking-tight">
            Tạo <span className="font-medium text-indigo-600">Playlist</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-md mx-auto">
            {activeTab === "smart"
              ? "Hệ thống tự động chọn ra 3 bài hát cùng cảm xúc, với tổng thời lượng chính xác 8 phút hoặc 9 phút rưỡi."
              : "Tự do lựa chọn danh sách các bài hát theo ý muốn và theo dõi tổng thời lượng."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1.5 bg-slate-200/50 rounded-2xl">
            <button
              onClick={() => setActiveTab("smart")}
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none",
                activeTab === "smart"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              Smart Vibe
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "px-6 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none",
                activeTab === "manual"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              Tạo Thủ Công
            </button>
          </div>
        </div>

        {/* Render Active Component */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full flex flex-col items-center"
          >
            {activeTab === "smart" ? <SmartPlaylist /> : <ManualPlaylist />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------- //
// MANUAL PLAYLIST COMPONENT                                                        //
// -------------------------------------------------------------------------------- //
function ManualPlaylist() {
  const router = useRouter();
  const allHymns = useHymns();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const results = useMemo(() => {
    if (!query) return allHymns;
    const q = removeAccents(query.toLowerCase().trim());
    return allHymns.filter((hymn) => {
      return (
        removeAccents(hymn.title).includes(q) ||
        hymn.hymn_number.toLowerCase().includes(q) ||
        hymn.keywords.some((kw) => removeAccents(kw).includes(q))
      );
    });
  }, [query, allHymns]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getHymnById = (id: string) => allHymns.find((h) => h.id === id);

  const totalDuration = selectedIds.reduce((sum, id) => {
    return sum + (getHymnById(id)?.duration_seconds || 0);
  }, 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startPresentation = () => {
    if (selectedIds.length === 0) return;
    const playlistParam = selectedIds.join(",");
    router.push(`/viewer/${selectedIds[0]}?playlist=${playlistParam}`);
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-20">
      {/* Search Bar */}
      <div className="relative mb-6 w-full max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm leading-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition-all"
          placeholder="Tìm tên bài hát hoặc số để thêm vào..."
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

      {/* Hymns List */}
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
        {results.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Không tìm thấy bài hát nào.
          </div>
        )}
        {results.map((hymn) => {
          const isSelected = selectedIds.includes(hymn.id);
          const queueIndex = isSelected ? selectedIds.indexOf(hymn.id) + 1 : null;

          return (
            <div
              key={hymn.id}
              onClick={() => toggleSelect(hymn.id)}
              className={cn(
                "group flex items-center gap-4 p-3 pr-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98]",
                isSelected
                  ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                  : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                {hymn.image_url ? (
                  <img src={hymn.image_url} alt={hymn.title} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-6 h-6 text-slate-300" />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {queueIndex}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className={cn("font-medium text-base truncate", isSelected ? "text-indigo-900" : "text-slate-900")}>
                    {hymn.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-2 bg-slate-100 px-2 py-0.5 rounded-md">
                    {formatDuration(hymn.duration_seconds)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Bài {hymn.hymn_number}</span>
                  <span>•</span>
                  <span>{hymn.category}</span>
                </div>
              </div>

              <button
                className={cn(
                  "w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-colors focus:outline-none",
                  isSelected
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                )}
              >
                {isSelected ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 md:bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
          >
            <div className="pointer-events-auto w-full max-w-2xl bg-slate-900 text-white rounded-t-3xl md:rounded-3xl shadow-2xl p-4 flex items-center justify-between border border-slate-800">
              <div className="flex flex-col ml-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Đã chọn duyệt</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-sm font-semibold">
                    {selectedIds.length} bài
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-base font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-md">
                    Tổng: {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>
              <button
                onClick={startPresentation}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-2xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                <Play className="w-4 h-4 fill-current" />
                Trình Chiếu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------------------------- //
// SMART PLAYLIST COMPONENT                                                         //
// -------------------------------------------------------------------------------- //
function SmartPlaylist() {
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [result, setResult] = useState<PlaylistResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const availableVibes = getAllAvailableVibes();

  const handleGenerate = () => {
    if (!selectedVibe) return;
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateVibePlaylist(selectedVibe);
      setResult(generated);
      setCurrentIndex(0);
      setIsGenerating(false);
    }, 600);
  };

  const handleNext = () => {
    if (result?.hymns && currentIndex < result.hymns.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-4">
          Chọn cảm xúc bạn muốn:
        </label>
        <div className="flex flex-wrap gap-2 mb-8">
          {availableVibes.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(vibe)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedVibe === vibe
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {vibe.charAt(0).toUpperCase() + vibe.slice(1)}
            </button>
          ))}
          {availableVibes.length === 0 && (
            <p className="text-sm text-slate-400 italic">Không tìm thấy vibe nào trong CSDL.</p>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedVibe || isGenerating}
          className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Tạo Playlist Tự Động</span>
            </>
          )}
        </button>
      </div>

      {result && !isGenerating && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-24">
          {result.success && result.hymns ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-100 overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-green-500"></div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Tìm thấy tổ hợp hoàn hảo!</h3>
                <span className="text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full inline-block shadow-sm">
                  Tổng thời lượng: {formatDuration(result.totalDuration || 0)}
                </span>
              </div>

              <div className="relative w-full aspect-[2/3] max-h-[500px] mb-6 rounded-2xl overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    {result.hymns[currentIndex].image_url ? (
                      <img
                        src={result.hymns[currentIndex].image_url}
                        alt={result.hymns[currentIndex].title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md text-slate-800 hover:bg-white transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                )}
                {currentIndex < result.hymns.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md text-slate-800 hover:bg-white transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 block">
                    Bài {currentIndex + 1} / 3
                  </span>
                  <h4 className="text-white font-medium text-lg truncate">
                    {result.hymns[currentIndex].title}
                  </h4>
                  <p className="text-white/70 text-sm mt-1">
                    Bài {result.hymns[currentIndex].hymn_number} • {formatDuration(result.hymns[currentIndex].duration_seconds)}
                  </p>
                </div>
              </div>

              <a
                href={`/viewer/${result.hymns[0].id}?playlist=${result.hymns.map((h) => h.id).join(",")}`}
                className="w-full flex items-center justify-center py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors gap-2"
              >
                <Play className="w-4 h-4" /> Bắt đầu Trình Chiếu
              </a>
            </div>
          ) : (
            <div className="bg-red-50 rounded-3xl p-6 text-center border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-red-800 font-medium mb-1">Không tìm thấy kết quả</h3>
              <p className="text-sm text-red-600/80">{result.message}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}