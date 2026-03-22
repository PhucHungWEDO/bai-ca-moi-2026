import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataPath = path.join(process.cwd(), "src/data/hymns_data.json");

    // Case 1: Bulk update of the whole list
    if (body.hymns && Array.isArray(body.hymns)) {
      await fs.writeFile(dataPath, JSON.stringify(body.hymns, null, 2), "utf8");
      
      revalidatePath("/admin/data");
      revalidatePath("/search");
      revalidatePath("/playlist");
      
      return NextResponse.json({ success: true, count: body.hymns.length });
    }

    // Case 2: Single record update by oldId
    const { oldId, updatedHymn } = body;
    if (oldId && updatedHymn) {
      const raw = await fs.readFile(dataPath, "utf8");
      const hymns = JSON.parse(raw);

      const index = hymns.findIndex((h: any) => String(h.id) === String(oldId));
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy bản ghi cũ với ID: " + oldId },
          { status: 404 }
        );
      }

      // Update the record with spread to keep existing data and apply updates
      hymns[index] = { ...hymns[index], ...updatedHymn };

      await fs.writeFile(dataPath, JSON.stringify(hymns, null, 2), "utf8");

      revalidatePath("/admin/data");
      revalidatePath("/search");
      revalidatePath("/playlist");
      revalidatePath(`/admin/data/${updatedHymn.id || oldId}`);

      return NextResponse.json({ success: true, updatedHymn: hymns[index] });
    }

    return NextResponse.json(
      { success: false, error: "Invalid payload format" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Lỗi khi lưu dữ liệu:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
