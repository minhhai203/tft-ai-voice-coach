# 🎮 TFT AI Voice Coach (`tft-ai-voice-coach`)

> **Trợ lý Huấn luyện viên AI Thời gian thực cho Đấu Trường Chân Lý (TFT)**  
> Vừa hiển thị giao diện trong suốt (In-game HUD Overlay) trên màn hình, vừa nhắc bài bằng **giọng nói Tiếng Việt** trực tiếp vào tai nghe với độ trễ siêu thấp (< 100ms – 150ms).

---

## ⚡ Điểm nổi bật (Key Features)

* **Bắt sự kiện tự động 100%:** Tích hợp trực tiếp **Overwolf Game Events API** cho TFT (Game ID: `5426` / `21570`) — đọc chuẩn xác 100% các vòng đấu, 3 Lõi nâng cấp, Đồ trong kho, Tướng trong shop mà **không cần chụp màn hình hay OCR**.
* **Bộ não quyết định siêu tốc với Jev (TypeSafe AI):**
  * `Choice`: Chọn Lõi công nghệ (Augment) tối ưu nhất, chọn Trang bị nên ghép từ mảnh hiện có.
  * `Noul`: Đưa ra xác suất có nên **Lên cấp (Level up)** hay **Tích tiền (Eco)** ngay tại các round bước ngoặt (2-5, 3-2, 4-1...).
  * `Shop Advisor`: Tự động nhận diện và đóng khung viền sáng khi tướng chủ lực xuất hiện trong cửa hàng.
* **Giọng nói tiếng Việt không độ trễ (Ultra-Low Latency Voice):**
  * Hỗ trợ **Piper TTS local** (tốc độ đọc < 40ms, không tốn VRAM card màn hình).
  * Tích hợp sẵn bộ dự phòng **Web Speech API** chạy trực tiếp trên nền tảng Overwolf.
* **Giao diện HUD Cyberpunk/Hextech trong suốt:** Nổi trên game, hỗ trợ cơ chế xuyên thấu chuột (click-through) không ảnh hưởng đến thao tác rê cờ.
* **100% Hợp lệ & An toàn:** Tuân thủ chuẩn mực của Riot Games, không can thiệp bộ nhớ RAM, không lo bị Riot Vanguard cấm tài khoản.

---

## 🏗️ Kiến trúc Hệ thống (Architecture)

```
[Trận đấu TFT] 
      │
      ▼ (Game Events JSON)
[Overwolf TFT Provider] (Store, Bench, Augments, Stage, Gold)
      │
      ▼
[Advisors Module] ──► [Jev AI Engine (TypeSafe AI)]
                      - Evaluate Level up (Noul)
                      - Evaluate Best Augment (Choice)
                      - Evaluate Item Craft (Choice)
      │
      ├──────────────────────────────┐
      ▼                              ▼
[In-Game HUD Overlay]        [Voice Engine (< 40ms)]
- Viền sáng Lõi nâng cấp     - Piper TTS / Web Speech
- Highlight nút Up cấp       - Phát thẳng câu nhắc vào tai nghe:
- Thẻ chiến thuật nổi          "Lên 7 ngay round này giữ chuỗi!"
```

---

## 📁 Cấu trúc Thư mục (Project Structure)

```
tft-ai-voice-coach/
├── manifest.json              # Khai báo ứng dụng Overwolf (Game ID: 5426)
├── icon.png, icon_gray.png    # Icon ứng dụng
├── package.json               # Cấu hình dự án & thư viện Jev SDK
├── test/
│   └── mock_game_events.js    # Kịch bản giả lập trận đấu để test ngay lập tức
└── src/
    ├── ai/
    │   └── jevClient.js       # Client kết nối Jev (Choice, Noul, Score) + Mock fallback
    ├── voice/
    │   └── voiceEngine.js     # Engine phát giọng nói Tiếng Việt siêu tốc (< 50ms)
    ├── advisors/
    │   ├── economyAdvisor.js  # Cố vấn Up cấp / Tích tiền / Roll
    │   ├── augmentAdvisor.js  # Cố vấn chọn 1 trong 3 Lõi nâng cấp
    │   ├── itemAdvisor.js     # Cố vấn ghép đồ từ các mảnh trong kho
    │   └── shopAdvisor.js     # Cố vấn phát hiện tướng chủ lực trong cửa hàng
    ├── background/
    │   ├── background.html    # Tiến trình chạy ngầm
    │   └── background.js      # Bộ điều phối sự kiện game & kích hoạt Advisors
    └── overlay/
        ├── overlay.html       # Màn hình HUD trong suốt
        ├── overlay.css        # Hiệu ứng viền sáng neon Hextech / Cyberpunk
        └── overlay.js         # Quản lý hiển thị card thông báo & khung viền sáng
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy thử

### 1. Chạy thử nghiệm ngay lập tức (Không cần mở game)

Dự án có sẵn kịch bản mô phỏng các round đấu 2-1, 2-5, 3-2 và cửa hàng để bạn kiểm tra logic:

```bash
# Cài đặt thư viện
npm install

# Chạy kịch bản giả lập
npm run test:mock
```

### 2. Cấu hình API Key của Jev (TypeSafe AI)

Tạo file `.env` hoặc thiết lập biến môi trường:

```bash
# Windows PowerShell
$env:TYPESAFE_API_KEY="your_api_key_here"
```
*(Nếu chưa có key, hệ thống sẽ tự động chuyển sang chế độ **Smart Mock Mode** để bạn vẫn phát triển và test mượt mà).*

### 3. Nạp ứng dụng vào Overwolf Developer Tools

1. Cài đặt [Overwolf](https://www.overwolf.com/) trên máy Windows của bạn.
2. Mở Cài đặt Overwolf $\rightarrow$ Vào mục **About** $\rightarrow$ Click liên tục vào phiên bản để bật **Development Options**.
3. Vào **Development Options** $\rightarrow$ Chọn **Load unpacked extension...** $\rightarrow$ Trỏ tới thư mục dự án `tft-ai-voice-coach`.
4. Bật Liên Minh Huyền Thoại / Đấu Trường Chân Lý (chế độ **Không viền - Borderless** hoặc **Cửa sổ**). Ứng dụng sẽ tự động kích hoạt khi vào trận!

---

## 🛠️ Tùy biến & Phát triển thêm

* **Đổi đội hình mục tiêu (Target Comp):** Chỉnh sửa trong `src/background/background.js` ở hàm `shopAdvisor.setTargetComp(...)` để đổi danh sách tướng cần ưu tiên mua.
* **Thêm công thức đồ mới:** Bổ sung vào bảng tra cứu `ITEM_RECIPES` trong `src/advisors/itemAdvisor.js`.
* **Cài đặt Piper TTS Local (Tùy chọn):** Cài đặt [rhasspy/piper](https://github.com/rhasspy/piper) và mở endpoint HTTP tại `http://127.0.0.1:5000/tts` để nhận diện giọng đọc Tiếng Việt chất lượng cao nhất.

---

## 📜 Giấy phép
Dự án được phân phối dưới giấy phép **MIT License**.
