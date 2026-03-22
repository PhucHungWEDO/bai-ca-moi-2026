import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { oldId, updatedHymn } = await request.json();

    if (!oldId || !updatedHymn) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dataPath = path.join(process.cwd(), "src/data/hymns_data.json");
    const raw = await fs.readFile(dataPath, "utf8");
    const hymns = JSON.parse(raw);

    const index = hymns.findIndex((h: any) => String(h.id) === String(oldId));
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bản ghi cũ với ID: " + oldId },
        { status: 404 }
      );
    }

    // Update the record
    hymns[index] = { ...hymns[index], ...updatedHymn };

    // Save back to file
    await fs.writeFile(dataPath, JSON.stringify(hymns, null, 2), "utf8");

    // Revalidate relevant paths
    revalidatePath("/admin/data");
    revalidatePath("/search");
    revalidatePath("/playlist");
    revalidatePath(`/admin/data/${updatedHymn.id}`);

    return NextResponse.json({ success: true, updatedHymn: hymns[index] });
  } catch (error: any) {
    console.error("Lỗi khi lưu bài hát:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
