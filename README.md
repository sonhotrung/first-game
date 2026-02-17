# 🚀 Space Shooter: Web-based 2D Game

Một tựa game bắn phi thuyền 2D được xây dựng hoàn toàn bằng **ReactJS** và **HTML5 Canvas**, tuân thủ nghiêm ngặt các nguyên tắc Clean Architecture, Object Pooling và tối ưu hóa vòng lặp (Game Loop) ở 60 FPS.

## ✨ Tính năng nổi bật
- **Game Loop Độc lập:** Tách bạch hoàn toàn giữa logic toán học (Update) và giao diện (Draw).
- **Chế độ chơi đa dạng:** Hỗ trợ chơi đơn (1 Player) và Co-op (2 Players) trên cùng một bàn phím.
- **Boss Fight:** Trùm cuối xuất hiện ở mốc 10.000 điểm với cơ chế khiên (Shield) bất tử tạm thời.
- **Độ khó tùy chỉnh:** 3 mức độ (Easy, Hard, Troll) can thiệp trực tiếp vào thời gian nạp đạn (Reload Time).
- **Responsive:** Canvas tự động tràn viền (Full-screen) thích ứng với mọi kích thước trình duyệt.

## 🛠 Cài đặt và Khởi chạy

Dự án sử dụng Vite làm module bundler. Để chạy dự án trên máy cá nhân, yêu cầu đã cài đặt Node.js.

```bash
# 1. Clone dự án về máy (Nếu có link Git)
# git clone <your-repo-url>

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy server phát triển
npm run dev
