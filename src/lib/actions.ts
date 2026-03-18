"use server";

import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

// Simple in-memory rate limiting (in production this should use Redis or similar)
const rateLimitMap = new Map<string, { attempts: number; timestamp: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute

export async function verifyPasscode(formData: FormData) {
  const passcode = formData.get("passcode")?.toString();
  const clientIp = "client";

  const rateLimit = rateLimitMap.get(clientIp) || { attempts: 0, timestamp: Date.now() };
  if (rateLimit.attempts >= MAX_ATTEMPTS) {
    if (Date.now() - rateLimit.timestamp < LOCKOUT_MS) {
      return { success: false, error: "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút." };
    } else {
      rateLimit.attempts = 0;
    }
  }

  const expectedPasscode = process.env.APP_PASSCODE;

  if (!expectedPasscode) {
    console.error("APP_PASSCODE environment variable is not set.");
    return { success: false, error: "Server Configuration Error" };
  }

  if (passcode === expectedPasscode) {
    rateLimitMap.delete(clientIp);

    const cookieStore = await cookies();
    cookieStore.set("auth-token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return { success: true };
  } else {
    rateLimit.attempts += 1;
    rateLimit.timestamp = Date.now();
    rateLimitMap.set(clientIp, rateLimit);

    return { success: false, error: "Mã PIN không đúng." };
  }
}

export async function saveHymnsData(hymns: any[]) {
  try {
    const dataPath = path.join(process.cwd(), "src/data/hymns_data.json");
    await fs.writeFile(dataPath, JSON.stringify(hymns, null, 2), "utf8");

    revalidatePath("/admin/data");
    revalidatePath("/search");
    revalidatePath("/playlist");

    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi lưu dữ liệu:", error);
    return { success: false, error: error.message };
  }
}

export async function saveLyrics(id: string, lyrics: string) {
  try {
    const dataPath = path.join(process.cwd(), "src/data/hymns_data.json");
    const raw = await fs.readFile(dataPath, "utf8");
    const hymns = JSON.parse(raw);

    const index = hymns.findIndex((h: any) => String(h.id) === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy bài hát." };
    }

    hymns[index].lyrics = lyrics;

    await fs.writeFile(dataPath, JSON.stringify(hymns, null, 2), "utf8");

    revalidatePath(`/admin/data/${id}`);
    revalidatePath(`/viewer/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi lưu lyrics:", error);
    return { success: false, error: error.message };
  }
}
