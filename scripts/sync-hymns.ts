import fs from "fs";
import path from "path";

const HYMNS_DIR = path.join(process.cwd(), "public", "hymns");
const DATA_FILE = path.join(process.cwd(), "src", "data", "hymns_data.json");

interface Hymn {
  id: string;
  hymn_number: string;
  title: string;
  category: string;
  image_url: string;
  keywords: string[];
  vibes: string[];
  duration_seconds: number;
}

function generateHymnsData() {
  if (!fs.existsSync(HYMNS_DIR)) {
    console.error(`Thư mục không tồn tại: ${HYMNS_DIR}`);
    return;
  }

  const files = fs.readdirSync(HYMNS_DIR);
  const hymnsData: Hymn[] = [];
  
  // Try to preserve existing custom data if hymns_data.json already exists
  let existingData: Record<string, Hymn> = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Hymn[];
      parsed.forEach(h => {
        existingData[h.id] = h;
      });
    } catch (e) {
      console.warn("Không thể đọc file hymns_data.json hiện tại. Sẽ tạo mới hoàn toàn.");
    }
  }

  let nextId = 1;

  for (const file of files) {
    if (!file.match(/\.(png|jpe?g|webp)$/i)) continue;

    // Định dạng mong đợi: [Số thứ tự]-[Tên_Bài_Hát].png
    // Ví dụ: 127-That_Chi_Thanh_Chi_Thanh.png
    const basename = path.basename(file, path.extname(file));
    
    // Split by the first hyphen
    const separatorIdx = basename.indexOf("-");
    
    let hymnNumber = "";
    let titleStr = basename;
    
    if (separatorIdx !== -1) {
      hymnNumber = basename.substring(0, separatorIdx).trim();
      titleStr = basename.substring(separatorIdx + 1).trim();
    } else {
      // Nếu không có dấu gạch ngang, lấy toàn bộ làm Tên bài hát
      titleStr = basename;
    }

    // Clean up title: replace hyphens/underscores with spaces
    titleStr = titleStr.replace(/[-_]/g, " ");

    const id = nextId.toString();
    const existing = existingData[id];

    hymnsData.push({
      id,
      hymn_number: existing?.hymn_number || hymnNumber || "000",
      title: titleStr, 
      category: existing?.category || "Bài Ca Phụ",
      image_url: `/hymns/${file}`,
      keywords: existing?.keywords || [],
      vibes: existing?.vibes || [],
      duration_seconds: existing?.duration_seconds || 180,
    });

    nextId++;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(hymnsData, null, 2), "utf-8");
  console.log(`✅ Đã đồng bộ thành công ${hymnsData.length} bài hát vào src/data/hymns_data.json`);
}

generateHymnsData();
