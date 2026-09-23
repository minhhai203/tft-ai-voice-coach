# 🎮 TFT AI Voice Coach (`tft-ai-voice-coach`)

> **Hệ thống AI Huấn luyện viên Cá nhân Thời gian thực cho Đấu Trường Chân Lý (TFT)**  
> Tự động theo dõi trận đấu, ra quyết định bằng **Jev AI (TypeSafe)**, hiển thị gợi ý trên **HUD Overlay trong suốt** và nhắc bài bằng **giọng nói Tiếng Việt siêu tốc** (< 100ms) trực tiếp vào tai nghe.

---

## 🎯 1. Ý định & Tầm nhìn của Dự án (Vision & Intention)

Trong một trận đấu TFT (Teamfight Tactics), thời gian chuẩn bị ở mỗi vòng chỉ kéo dài từ **25 – 30 giây**. Người chơi thường xuyên bị quá tải thông tin: vừa phải quan sát cửa hàng, quản lý kinh tế, xếp lại đội hình, kiểm tra trang bị, vừa phải theo dõi đối thủ.

**Ý định cốt lõi của dự án:**
1. **Trải nghiệm Hands-free hoàn toàn (Người chơi KHÔNG CẦN NÓI):**
   * Người chơi không cần dùng micro hay khẩu lệnh, tay và mắt tập trung 100% vào việc rê cờ, mua bán tướng và roll bài.
2. **Cơ chế Bắt sự kiện Chủ động (Event-Driven Proactive Coach):**
   * App tự động "nhìn" diễn biến trận đấu theo thời gian thực (Real-time). Khi đến các mốc bước ngoặt (vòng chọn Lõi 2-1/3-2/4-2, round nhặt đồ, mốc cấp độ chuẩn 2-5/3-2/4-1, shop xuất hiện tướng chủ lực), hệ thống sẽ lập tức can thiệp và nhắc bài.
3. **Phản hồi Kép (Visual HUD + Voice In-Ear):**
   * **Giao diện (HUD):** Cửa sổ trong suốt đè lên màn hình game, vẽ viền sáng (Highlight) xung quanh Lõi nên chọn, nhấp nháy nút Up Cấp, hiện thẻ gợi ý comp & đồ.
   * **Giọng nói (Voice):** Phát câu nhắc súc tích bằng **Tiếng Việt tự nhiên** thẳng vào tai nghe trong vòng **dưới 100ms – 150ms** (gần như tức thì).
4. **An toàn 100% với Riot Vanguard:**
   * Không can thiệp vào bộ nhớ RAM của game, không sử dụng macro hay giả lập click chuột tự động chơi. Tuân thủ 100% điều khoản dịch vụ (ToS) của Riot Games dành cho phần mềm hỗ trợ người chơi (Companion App).

---

## 📚 2. Các Nguồn Tham Khảo & Kế Thừa (Base References)

Dự án được kết hợp từ những thế mạnh vượt trội nhất của các mã nguồn và nền tảng mở:

| Nguồn tham khảo | Vai trò trong dự án | Điểm kế thừa & tích hợp |
| :--- | :--- | :--- |
| 🌐 **[Overwolf Events SDK](https://github.com/overwolf/events-sample-apps)** *(Game ID: `5426` / `21570`)* | **Đôi mắt (Data Provider)** | Tận dụng cơ chế bắt sự kiện game chính thức đã được Riot Games phê duyệt. Trích xuất dữ liệu JSON thời gian thực gồm: `augments` (3 Lõi), `store` (Cửa hàng), `bench` (Đồ & Hàng chờ), `board` (Bàn cờ), `match_info` (Máu, Vàng, Round) mà **không cần dùng OCR hay chụp màn hình**. |
| 🦀 **[tft-synapse](https://github.com/Mattbusel/tft-synapse)** | **Kiến trúc Cố vấn (Advisors)** | Kế thừa tư duy phân tách 4 bộ cố vấn chuyên biệt: `Shop Advisor`, `Board Advisor`, `Economy Advisor`, `Item Advisor`, cùng thiết kế giao diện HUD trong suốt hỗ trợ phím tắt xuyên thấu chuột (click-through). |
| 🧠 **[Jev AI - TypeSafe AI](https://typesafe.ai)** | **Bộ não ra quyết định (Decision Engine)** | Thay thế toàn bộ các luật `if/else` cứng nhắc cũ bằng mô hình **System 1 Decision-Making** siêu tốc, trả về xác suất cấu trúc Type-safe không hallucinate. |
| 🔊 **[Piper TTS](https://github.com/rhasspy/piper)** | **Bộ phát âm siêu tốc (Voice Engine)** | Công nghệ Text-to-Speech cục bộ chạy bằng C++/ONNX với model Tiếng Việt (`vi_VN-vivos`), sinh âm thanh chỉ mất **~30ms – 40ms**, ăn dưới 200MB RAM, không tải GPU. |
| 📊 **Dữ liệu Meta (Tactics.tools, MetaTFT, Data Dragon)** | **Kho tri thức chiến thuật** | Dữ liệu comps hot, tỉ lệ thắng (Winrate), trang bị chuẩn (BiS items) và sơ đồ vị trí xếp cờ được cập nhật liên tục theo từng bản vá (patch). |

---

## 🛠️ 3. Stack Công Nghệ Dự Kiến (Expected Tech Stack)

Hệ thống được thiết kế theo cấu trúc module rời rạc (modular architecture) để đạt hiệu năng tối đa:

### A. Giao diện & Nền tảng Overlay (In-Game HUD)
* **Nền tảng:** **Overwolf Client API** (hoặc **Tauri/Electron** cho phiên bản standalone).
* **Công nghệ UI:** **HTML5, CSS3 (Modern Flexbox/Grid), JavaScript (ESNext)**.
* **Phong cách thiết kế:** Neon Hextech / Cyberpunk HUD với nền trong suốt (`transparent: true`), chế độ click-through (`pointer-events: none`), hiệu ứng viền phát sáng (Glow Highlights) và thẻ thông tin chuyển động mượt mà.

### B. Bộ não Phân tích & Ra quyết định (Decision Engine)
* **Mô hình AI:** **Jev (TypeSafe AI)** thông qua SDK `@typesafe-ai/sdk`.
* **Các Primitives ứng dụng trong TFT:**
  * **`Choice`:** Chọn 1 phương án tối ưu trong danh sách (Chọn 1 trong 3 Lõi nâng cấp, chọn trang bị nên ghép từ các mảnh trong kho đồ, chọn Comp meta phù hợp nhất).
  * **`Noul`:** Xác suất nhị phân $0.0 \rightarrow 1.0$ (Quyết định có nên **Lên cấp (Level up)** ngay round này hay không? Có nên **Roll cạn tiền** để giữ máu không?).
  * **`Score`:** Đánh giá điểm sức mạnh bàn cờ hiện tại (Board Strength) so với mặt bằng chung sảnh đấu.
* **Chế độ Dự phòng (Smart Mock Fallback):** Tự động hoạt động dựa trên các mốc cấp độ chuẩn nếu không có kết nối internet hoặc chưa thiết lập API key.

### C. Bộ phát Âm thanh Giọng nói (Voice & Audio Pipeline)
* **Động cơ chính:** **Piper TTS** chạy service local ngầm (`http://127.0.0.1:5000/tts`), sử dụng mô hình giọng đọc Tiếng Việt `vi_VN-vivos-low.onnx`.
* **Động cơ dự phòng:** **Chromium Web Speech API** (`window.speechSynthesis`) với giọng Tiếng Việt tích hợp sẵn trên hệ điều hành / trình duyệt.
* **Cơ chế điều phối âm thanh:** Hàng đợi (Queue) thông minh kết hợp bộ lọc chống lặp từ (Cooldown Debounce) để tránh hiện tượng nói đè hoặc lặp đi lặp lại.

### D. Tầng Dữ liệu Meta & Crawler (Meta Data Pipeline)
* **Crawler:** Python (Playwright / Beautiful Soup) hoặc Node.js (Cheerio) cào định kỳ dữ liệu từ Tactics.tools & MetaTFT.
* **Tài nguyên hình ảnh:** Riot Games Data Dragon CDN (icon tướng, trang bị, tộc hệ).
* **Cơ sở dữ liệu cục bộ:** File `JSON` chuẩn hóa hoặc `SQLite` nhúng trong app.

---

## 🔄 4. Luồng Dữ Liệu Hoạt Động (System Workflow)

```
┌────────────────────────────────────────────────────────┐
│               TRẬN ĐẤU TFT ĐANG DIỄN RA                │
│ (Người chơi tập trung 100% thao tác, không cần nói)    │
└──────────────────────────┬─────────────────────────────┘
                           │ 
                           ▼ (Bắt sự kiện JSON chính xác 100%)
┌────────────────────────────────────────────────────────┐
│           OVERWOLF GAME EVENTS PROVIDER                │
│ - Stage: 3-2, Gold: 34, Level: 6, Streak: 3 thắng     │
│ - Kho đồ: [Kiếm B.F, Nước Mắt, Gậy Quá Khổ]           │
│ - Xuất hiện 3 Lõi: [Lõi A, Lõi B, Lõi C]               │
└──────────────────────────┬─────────────────────────────┘
                           │ 
                           ▼ (Đóng gói State Context)
┌────────────────────────────────────────────────────────┐
│             BỘ 4 CỐ VẤN CHIẾN THUẬT (ADVISORS)         │
│  EconomyAdvisor  │  AugmentAdvisor  │  ItemAdvisor     │
└──────────────────────────┬─────────────────────────────┘
                           │ 
                           ▼ (Gọi Jev SDK trong ~30ms)
┌────────────────────────────────────────────────────────┐
│            JEV AI ENGINE (TYPESAFE AI)                 │
│ - Choice: Chọn Lõi tốt nhất                            │
│ - Choice: Chọn Đồ nên ghép (Spear of Shojin)           │
│ - Noul: Xác suất Lên cấp 7 = 0.88                      │
└──────────────────────────┬─────────────────────────────┘
                           │ 
            ┌──────────────┴──────────────┐
            ▼ (0ms)                       ▼ (~35ms)
┌───────────────────────┐   ┌────────────────────────────┐
│   HUD OVERLAY XUYÊN   │   │   GIỌNG NÓI TIẾNG VIỆT     │
│ - Viền sáng quanh Lõi │   │   (PIPER LOCAL TTS)        │
│ - Nhấp nháy nút Up    │   │ - "Lên 7 ngay round này,   │
│ - Thẻ gợi ý nổi       │   │    ghép luôn Shojin đi!"   │
└───────────────────────┘   └────────────────────────────┘
```

---

## 📂 5. Cấu Trúc Mã Nguồn Hiện Tại

```
tft-ai-voice-coach/
├── manifest.json              # Khai báo cấu hình Overwolf App (Game ID: 5426)
├── icon.png, icon_gray.png    # Icon nhận diện của ứng dụng
├── package.json               # Cấu hình dự án & thư viện Jev SDK (@typesafe-ai/sdk)
├── README.md                  # Tài liệu chi tiết dự án
├── test/
│   └── mock_game_events.js    # Kịch bản giả lập các round 2-1, 2-5, 3-2 để test local
└── src/
    ├── ai/
    │   └── jevClient.js       # Client kết nối Jev (Choice, Noul, Score) + Smart Mock
    ├── voice/
    │   └── voiceEngine.js     # Engine phát âm thanh Tiếng Việt độ trễ siêu thấp
    ├── advisors/
    │   ├── economyAdvisor.js  # Cố vấn Lên cấp / Tích tiền / Eco
    │   ├── augmentAdvisor.js  # Cố vấn chọn Lõi nâng cấp tối ưu
    │   ├── itemAdvisor.js     # Cố vấn ghép trang bị từ mảnh trong kho
    │   └── shopAdvisor.js     # Cố vấn nhận diện tướng chủ lực trong cửa hàng
    ├── background/
    │   ├── background.html    # Trang HTML chạy ngầm của Overwolf
    │   └── background.js      # Bộ điều phối sự kiện game & kích hoạt Advisors
    └── overlay/
        ├── overlay.html       # Giao diện HUD in-game trong suốt
        ├── overlay.css        # Hiệu ứng viền sáng neon Hextech / Cyberpunk
        └── overlay.js         # Xử lý hiển thị card thông báo & khung viền sáng
```

---

## ⚡ 6. Hướng Dẫn Thử Nghiệm Nhanh

### Chạy giả lập ngay trên máy (Không cần mở game):
```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy test giả lập chuỗi sự kiện TFT
npm run test:mock
```

---

## 📜 Giấy Phép
Dự án được xây dựng và phát triển mã nguồn mở dưới giấy phép **MIT License**.
