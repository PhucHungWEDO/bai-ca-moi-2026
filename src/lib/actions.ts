"use server";

import { cookies } from "next/headers";

// Simple in-memory rate limiting (in production this should use Redis or similar)
// For Next.js Vercel serverless, this memory is cleared on function cold start,
// but it's sufficient for basic protection against quick brute force.
const rateLimitMap = new Map<string, { attempts: number; timestamp: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute

export async function verifyPasscode(formData: FormData) {
  const passcode = formData.get("passcode")?.toString();
  const clientIp = "client"; // In App Router actions, getting raw IP is complex, we'll just mock a global rate limit for simplicity
  
  // Rate Limit Check
  const rateLimit = rateLimitMap.get(clientIp) || { attempts: 0, timestamp: Date.now() };
  if (rateLimit.attempts >= MAX_ATTEMPTS) {
    if (Date.now() - rateLimit.timestamp < LOCKOUT_MS) {
      return { success: false, error: "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút." };
    } else {
      // Reset after lockout
      rateLimit.attempts = 0;
    }
  }

  const expectedPasscode = process.env.APP_PASSCODE;
  
  if (!expectedPasscode) {
    console.error("APP_PASSCODE environment variable is not set.");
    return { success: false, error: "Server Configuration Error" };
  }

  if (passcode === expectedPasscode) {
    // Reset rate limit on success
    rateLimitMap.delete(clientIp);
    
    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    
    return { success: true };
  } else {
    // Increment attempts
    rateLimit.attempts += 1;
    rateLimit.timestamp = Date.now();
    rateLimitMap.set(clientIp, rateLimit);
    
    return { success: false, error: "Mã PIN không đúng." };
  }
}

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function saveHymnsData(hymns: any[]) {
  // In a real Vercel app without a DB, this fs.writeFile won't persist across deployments.
  // But for the purpose of this project and local execution, we're fulfilling the user's explicit request.
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
