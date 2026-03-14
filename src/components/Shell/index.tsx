"use client";

import { Home, Search, ListMusic } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Shell() {
  const pathname = usePathname();

  // Ẩn Header/Bottom Nav ở màn hình login
  if (pathname === "/login") return null;

  return (
    <>
      {/* Desktop Header Layout */}
      <header className="hidden md:flex items-center justify-between sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <ListMusic className="w-6 h-6 text-slate-900" />
          <h1 className="text-xl font-light tracking-tight text-slate-900">
            Bài Ca Mới <span className="font-semibold px-1">2026</span>
          </h1>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-slate-900",
              pathname === "/" ? "text-slate-900" : "text-slate-500"
            )}
          >
            Trang chủ
          </Link>
          <Link
            href="/search"
            className={cn(
              "text-sm font-medium transition-colors hover:text-slate-900",
              pathname === "/search" ? "text-slate-900" : "text-slate-500"
            )}
          >
            Tìm kiếm
          </Link>
          <Link
             href="/playlist"
             className={cn(
               "text-sm font-medium transition-colors hover:text-slate-900",
               pathname === "/playlist" ? "text-slate-900" : "text-slate-500"
             )}
          >
            Vibe Playlist
          </Link>
        </nav>
      </header>

      {/* Mobile Header (Minimal) */}
      <header className="md:hidden flex items-center justify-center sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-3">
         <h1 className="text-lg font-light tracking-tight text-slate-900">
            Bài Ca Mới <span className="font-semibold px-1">2026</span>
         </h1>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center h-16 px-4">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              pathname === "/" ? "text-slate-900" : "text-slate-400 hover:text-slate-900"
            )}
          >
            <Home className="w-5 h-5" strokeWidth={pathname === "/" ? 2 : 1.5} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          
          <Link
            href="/search"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              pathname === "/search" ? "text-slate-900" : "text-slate-400 hover:text-slate-900"
            )}
          >
            <Search className="w-5 h-5" strokeWidth={pathname === "/search" ? 2 : 1.5} />
            <span className="text-[10px] font-medium">Search</span>
          </Link>

          <Link
            href="/playlist"
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              pathname === "/playlist" ? "text-slate-900" : "text-slate-400 hover:text-slate-900"
            )}
          >
            <ListMusic className="w-5 h-5" strokeWidth={pathname === "/playlist" ? 2 : 1.5} />
            <span className="text-[10px] font-medium">Playlist</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
