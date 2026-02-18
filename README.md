# 🚀 Space Shooter: Hardcore Co-op

Một tựa game bắn phi thuyền 2D Top-down đậm chất hành động, được xây dựng hoàn toàn bằng **ReactJS** và **HTML5 Canvas**. Dự án không sử dụng bất kỳ Game Engine có sẵn nào, tự xây dựng hệ thống Vật lý, Quản lý Vòng lặp (Game Loop 60 FPS), Thuật toán Va chạm AABB và Object Pooling tối ưu hiệu suất.



## ✨ Tính năng nổi bật

* **Kiến trúc Game Engine Độc lập:** Tách bạch hoàn toàn giữa Logic vật lý (Update) và Giao diện (Draw/Render). 
* **Chế độ chơi Đa dạng:** Hỗ trợ chơi đơn (1 Player) và Co-op (2 Players) trên cùng một thiết bị. Có riêng phòng **Shooting Range** để thử súng.
* **Độ khó Phân tầng (Difficulty Scaling):** 3 mức độ (EASY, HARD, TROLL) can thiệp trực tiếp vào lượng đạn và thời gian nạp đạn. Chế độ TROLL mang lại trải nghiệm sinh tồn cực độ.
* **Cơ chế Kẻ địch Thông minh:** * Quái vật mạnh dần theo điểm số (Máu tăng từ 3 -> 5 -> 8).
    * Trùm cuối (Boss) xuất hiện ở mốc 10.000 điểm với 100 HP, sở hữu cơ chế Khiên Bất Tử (Shield) và triệu hồi đệ tử mỗi 2 giây. Loại đệ tử được gọi ra phụ thuộc vào lượng máu còn lại của Boss.
* **Responsive Toàn màn hình:** Trải nghiệm Full-screen tự động thích ứng với mọi độ phân giải trình duyệt.

## 🔫 Kho Vũ Khí (Weapon Armory)

Người chơi được phép chọn vũ khí ngay từ đầu game. Mỗi loại súng mang một đặc tính chiến thuật riêng biệt:

| Tên Vũ khí | Đặc điểm Chiến thuật | Thuộc tính Đặc biệt |
| :--- | :--- | :--- |
| **Pistol** | Vũ khí cơ bản, cân bằng mọi chỉ số. | N/A |
| **Sniper** | Sát thương cực lớn (8 HP), nạp đạn rất lâu. | **Piercing:** Đạn xuyên thấu tối đa 3 mục tiêu, giảm nửa sát thương sau mỗi lần xuyên. |
| **SMG** | Tốc độ bắn cao, nạp đạn nhanh nhất game. | **Run & Gun:** Phù hợp di chuyển liên tục dọn quái nhỏ. |
| **Machine Gun** | Băng đạn khổng lồ, xả đạn như mưa. | Nạp đạn cực lâu, ép người chơi phải tìm góc nấp an toàn. |
| **Shotgun** | Sát thương dồn diện rộng cực mạnh. | **Spread:** Bóp cò 1 lần xả 10 viên đạn tỏa theo hình nón 45 độ. |
| **Assault Rifle** | Cân bằng giữa sát thương và độ giật. | **Burst Fire:** Bắn liên thanh loạt 3 viên tự động vô cùng uy lực. |

## 🎮 Hướng dẫn Điều khiển

Hệ thống hỗ trợ 2 người chơi độc lập không bị kẹt phím:

| Hành động | Player 1 (Phi thuyền Xanh lá) | Player 2 (Phi thuyền Xanh biển) |
| :--- | :---: | :---: |
| **Di chuyển Trái** | `Arrow Left` (⬅️) | `A` |
| **Di chuyển Phải** | `Arrow Right` (➡️) | `D` |
| **Bắn đạn** | `Arrow Up` (⬆️) | `W` |
| **Nạp đạn** | `Arrow Down` (⬇️) | `S` |
| **Tạm dừng / Mở Menu**| `ESC` | `ESC` |

## 🛠 Cài đặt và Khởi chạy Phát triển

Dự án sử dụng **Vite** để tối ưu hóa tốc độ build và Hot Module Replacement (HMR). Yêu cầu máy tính đã cài đặt Node.js.

```bash
# 1. Clone dự án về máy
git clone <your-repo-url>

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy server phát triển
npm run dev
