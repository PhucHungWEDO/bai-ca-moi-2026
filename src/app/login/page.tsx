"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPasscode } from "@/lib/actions";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await verifyPasscode(formData);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Có lỗi xảy ra.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-slate-800">
          <div className="h-16 w-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extralight text-slate-900 tracking-tight">
          Bài Ca Mới <span className="font-semibold px-2">2026</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Vui lòng nhập mã PIN để truy cập
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 sm:rounded-2xl sm:px-10">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="passcode" className="sr-only">
                Mã PIN
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="passcode"
                  name="passcode"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  maxLength={6}
                  className="appearance-none block w-full px-3 py-4 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-lg text-center tracking-[0.5em] transition-colors"
                  placeholder="••••"
                  disabled={isPending}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 font-medium text-center">
                  {error}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Truy cập</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
