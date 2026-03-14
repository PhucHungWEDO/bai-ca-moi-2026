import { Suspense } from "react";
import HymnViewer from "@/components/HymnViewer";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-slate-500">Đang tải...</div>}>
        <HymnViewer initialId={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
