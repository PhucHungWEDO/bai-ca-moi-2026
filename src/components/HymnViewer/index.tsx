"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Maximize, Minimize, Loader2, ZoomIn, ZoomOut, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllHymns } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ViewerProps {
  initialId: string;
}

export default function HymnViewer({ initialId }: ViewerProps) {
  const router = useRouter();
  const [hymns, setHymns] = useState(getAllHymns());
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // App States
  const [zenMode, setZenMode] = useState(false);
  const [fitToWidth, setFitToWidth] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Playlist Params
  const searchParams = useSearchParams();
  const playlistParam = searchParams.get('playlist');

  // Initialize index based on ID
  useEffect(() => {
    let list = getAllHymns();
    if (playlistParam) {
      const ids = playlistParam.split(",");
      list = ids.map(id => list.find(h => h.id === id)).filter(Boolean) as typeof list;
    }
    setHymns(list);
    const index = list.findIndex(h => h.id === initialId);
    if (index !== -1) setCurrentIndex(index);
  }, [initialId, playlistParam]);

  const currentHymn = hymns[currentIndex];

  // Reset states on new hymn
  useEffect(() => {
    setZoomLevel(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // Navigation Handlers
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsLoading(true);
      setCurrentIndex(prev => prev - 1);
      
      // Preserve query params
      const currentQuery = searchParams.toString();
      const queryString = currentQuery ? `?${currentQuery}` : '';
      window.history.replaceState(null, "", `/viewer/${hymns[currentIndex - 1].id}${queryString}`);
    }
  }, [currentIndex, hymns, searchParams]);

  const handleNext = useCallback(() => {
    if (currentIndex < hymns.length - 1) {
      setIsLoading(true);
      setCurrentIndex(prev => prev + 1);
      
      const currentQuery = searchParams.toString();
      const queryString = currentQuery ? `?${currentQuery}` : '';
      window.history.replaceState(null, "", `/viewer/${hymns[currentIndex + 1].id}${queryString}`);
    }
  }, [currentIndex, hymns, searchParams]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "f":
        case "F":
          setZenMode(prev => !prev);
          break;
        case "w":
        case "W":
          setFitToWidth(prev => !prev);
          break;
        case "Escape":
          setZenMode(false);
          break;
        case "=":
        case "+":
          setZoomLevel(prev => Math.min(prev + 0.2, 3));
          break;
        case "-":
          setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);


  // Scroll Handler for FAB
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    setShowScrollTop(scrollContainerRef.current.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Swipe Logic
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Only capture X axis for swiping
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Swipe Left goes to Next (like flipping a page forward)
    if (isLeftSwipe && currentIndex < hymns.length - 1) {
      handleNext();
    }
    // Swipe Right goes to Previous (like flipping a page back)
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
  };

  if (!currentHymn) return <div className="min-h-screen flex flex-col items-center justify-center">Loading...</div>;

  return (
    <div className={cn(
      "h-screen bg-slate-950 flex flex-col transition-colors duration-500 overflow-hidden",
      zenMode ? "bg-black" : ""
    )}>
      {/* Top Navigation Bar / Toolbar */}
      <AnimatePresence>
        {!zenMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between"
          >
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex-1 text-center truncate px-4">
              <h2 className="text-white font-medium truncate text-sm sm:text-base">
                {currentHymn.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bài {currentHymn.hymn_number} • {currentIndex + 1} / {hymns.length}
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-medium w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors mr-2"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-white/20 mx-1 hidden sm:block"></div>

              <button
                onClick={() => setFitToWidth(!fitToWidth)}
                className={cn(
                  "p-2 rounded-full transition-colors hidden sm:block",
                  fitToWidth ? "text-blue-400 bg-blue-400/10" : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
                title="Fit to Width (W)"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZenMode(true)}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Zen Mode (F)"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest border border-current rounded px-1.5 py-0.5">Zen</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Image Viewer Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 relative w-full overflow-y-auto overflow-x-hidden touch-pan-y custom-scrollbar",
          !zenMode && "pt-[80px]" // Top padding to avoid header overlap
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHymn.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "relative mx-auto flex flex-col items-center pb-24", // Generous bottom padding so footer isn't cramped
              fitToWidth ? "w-full" : "max-w-[1200px] px-2 md:px-6"
            )}
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out'
            }}
          >
            {/* Loading Indicator beneath image */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-0 h-64">
                <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
              </div>
            )}
            
            <img
              src={currentHymn.image_url}
              alt={currentHymn.title}
              className={cn(
                "select-none pointer-events-none z-10 transition-shadow duration-300 w-full",
                zenMode ? "rounded-none" : "rounded-none md:rounded-lg shadow-2xl"
              )}
              onLoad={() => setIsLoading(false)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-slate-800/80 hover:bg-slate-700 backdrop-blur text-white rounded-full shadow-lg border border-white/10 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* UX Hint Overlay for Zen Mode */}
      <AnimatePresence>
        {zenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 inset-x-0 mx-auto w-max z-50 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white/50 text-xs tracking-widest uppercase border border-white/10">
              Nhấn ESC hoặc F để thoát
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
