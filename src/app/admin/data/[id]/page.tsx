"use client";

// File: src/app/admin/data/[id]/page.tsx

import { getAllHymns } from "@/lib/data";
import LyricsForm from "@/components/LyricsForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LyricsPage({ params }: { params: { id: string } }) {
  const hymns = getAllHymns();
  const hymn = hymns.find((h: any) => h.id === params.id);

  if (!hymn) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 px-4 md:px-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin/data"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>

        <h1 className="text-3xl font-light text-slate-900 mb-1">
          Lời bài hát{" "}
          <span className="font-medium">#{hymn.hymn_number}</span>
        </h1>
        <p className="text-slate-500 mb-8">{hymn.title}</p>

        <LyricsForm hymn={hymn} />
      </div>
    </div>
  );
}
