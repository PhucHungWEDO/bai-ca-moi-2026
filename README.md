# 🎵 BÀI CA MỚI 2026 - Quản lý Nhạc Thánh

Hệ thống quản lý và trình chiếu lời bài hát, hợp âm cho nhóm thờ phượng. Được tối ưu hóa cho tốc độ và trải nghiệm di động.

## 🚀 Tính năng cốt lõi

- **Tìm kiếm thông minh:** Tìm theo tiêu đề, từ khóa và lời bài hát (Fuzzy Search).
- **Trình chiếu Mobile:** Hỗ trợ phóng to/thu nhỏ (pinch-to-zoom) để ca viên dễ dàng theo dõi.
- **Bảo mật:** Truy cập thông qua Passcode được cấu hình qua Biến môi trường.
- **Hiệu suất 10/10:** Kiến trúc tĩnh chạy trên Next.js & Vercel.

## 🛠 Lệnh CLI Thực chiến

Dành cho việc quản lý hàng ngày:

- `npm run dev` : Chạy môi trường thử nghiệm tại localhost:3000.
- `git add .` : Gom các thay đổi (lời bài hát, giao diện).
- `git commit -m "Mô tả thay đổi"` : Ghi chú nội dung cập nhật.
- `git push origin main` : Đẩy code lên GitHub & Tự động Deploy lên Vercel.

## 📁 Cấu trúc thư mục ngăn nắp

- `src/data/hymns_data.json`: Nơi chứa toàn bộ dữ liệu 400 bài hát.
- `public/hymns/`: Thư mục chứa ảnh bản nhạc gốc.
- `src/app/`: Chứa giao diện và logic của ứng dụng.

---
*Dự án được xây dựng với mục tiêu phụng sự và tối ưu hóa cuộc sống theo tinh thần Cơ Đốc.*
