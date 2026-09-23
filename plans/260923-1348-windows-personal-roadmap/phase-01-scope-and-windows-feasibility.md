---
phase: 1
title: "Scope and Windows feasibility"
status: pending
priority: P1
effort: "1–2 ngày"
dependencies: []
---

# Pha 1: Chốt phạm vi và kiểm chứng Windows

## Bối cảnh

Đọc [đánh giá dự án](./reports/project-assessment.md) và [roadmap](./plan.md). Người dùng xác nhận dùng cá nhân, ưu tiên ổn định và nhắc ít nhưng đúng; chưa xác nhận đổi tầm nhìn gốc sang pregame/static/postgame. Các công việc dưới đây là kế hoạch tương lai, chưa thực hiện trên máy Windows.

## Tổng quan

Giải quyết hai rủi ro có thể làm thay đổi toàn bộ kế hoạch: hành vi coach có được chấp nhận và môi trường Windows có cung cấp dữ liệu cần thiết không. Không xây tiếp các advisor trước khi có bằng chứng.

## Yêu cầu

- Ghi nhận Windows 11, i5-12400F, RAM 16 GB, RTX 2060 6 GB; kiểm tra thực tế độ phân giải, DPI, chế độ cửa sổ và phiên bản Overwolf/TFT.
- Kiểm tra driver/runtime riêng nếu cần; “CUDA 13.1” chưa phải bằng chứng tương thích model. MVP dùng CPU, không cài CUDA mới chỉ để đáp ứng README.
- Có ma trận hành vi: pregame, thông tin tĩnh trong trận, voice trong trận, nhận xét sau trận, lời khuyên thích ứng trực tiếp. Mỗi dòng ghi nguồn/quy định, trạng thái kiểm chứng, quyết định bật/tắt và ngày kiểm tra.
- Không coi custom match là ngoại lệ tự động. Không thu thập hoặc hiển thị augments khi tài liệu Overwolf cảnh báo không hỗ trợ/hiển thị.
- Không gọi provider trả phí, không nhúng API key vào browser, không triển khai trên macOS.

## Kiến trúc

Giữ shell Overwolf hiện tại để kiểm chứng khả năng load unpacked app, quyền API và vòng đời cửa sổ. Tách các mode cấu hình: `pregame`, `in-game-static`, `postgame`, `offline-simulation`. Mode live-adaptive chưa được phép bật chỉ vì người dùng có tài khoản game hoặc SDK hoạt động. Nếu quyền nền tảng hoặc phạm vi sử dụng chưa rõ, nhánh game vẫn tắt; công việc dữ liệu synthetic tiếp tục được.

`5426` là game class dùng chung LoL/TFT trong tích hợp hiện tại; `21570` là định danh khác trong nguồn status. Không thay mọi ID thành một số. Xác nhận tín hiệu phân biệt TFT đủ tin cậy trước khi kích hoạt app; không nhận diện được thì không chạy coach.

## File liên quan

Các đường dẫn dưới đây là checkout macOS hiện tại để định vị mã; không giả định đây là đường dẫn triển khai Windows.

| Hành động dự kiến | Đường dẫn tuyệt đối | Mục đích |
|---|---|---|
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/README.md` | Tách vision, khả năng đã có, đề xuất và số đo chưa kiểm chứng |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/package.json` | Bỏ phụ thuộc bắt buộc đang không cài được; mô tả lệnh thật |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/manifest.json` | Xác minh schema, quyền, tài nguyên, hotkey và game targeting |
| Sửa file hiện có | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/src/background/background.js` | Gating mode/game; không tự kích hoạt advisor chưa kiểm chứng |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/windows-feasibility.md` | Bằng chứng load app, quyền, dữ liệu và vấn đề chặn |
| Tạo mới, chưa tồn tại | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/docs/product-scope.md` | Ma trận hành vi và lựa chọn của người dùng |
| Tạo mới nếu còn dependency | `/Users/minhhai/workspace/ai/projects/tft-ai-voice-coach/package-lock.json` | Khóa phiên bản sau khi xác minh API và nhu cầu |

Không xóa source trong pha này. Bổ sung icon còn thiếu chỉ khi kiểm tra manifest xác nhận cần; không xem tên icon trong README là file đã có.

## Các bước thực hiện

1. Ghi baseline repo, lệnh giả lập, lỗi cài đặt và giới hạn test; chuyển các số “100%”, “<100ms”, “30–40ms” thành mục tiêu có điều kiện trong tài liệu.
2. Chốt độ phân giải/DPI, vai trò Jev và phạm vi MVP với người dùng. Trình bày rõ trade-off: pregame/postgame ít phụ thuộc live-policy; vision live cần thêm xác nhận, dữ liệu và chi phí kiểm chứng.
3. Đối chiếu lại tài liệu Riot TFT, Overwolf native TFT và điều kiện developer/unpacked app tại thời điểm thực hiện; ghi các điều còn mơ hồ, tìm xác nhận phù hợp trước khi bật hành vi live.
4. Kiểm tra trên Windows khả năng cài/chạy nền tảng, load app, quyền events, asset manifest, mở/đóng overlay và phân biệt LoL/TFT. Xác minh khả năng khai báo desktop window hoạt động khi game chưa mở/đã thoát, vì overlay in-game hiện có không cung cấp surface pregame/postgame. Lưu phiên bản, bước thao tác, kết quả; không dùng screenshot mock làm bằng chứng game thật.
5. Nếu được phép lấy dữ liệu, lưu một tập payload tối thiểu đã loại bỏ thông tin cá nhân để đối chiếu schema. Nếu chưa được phép/không truy cập được, dùng fixture synthetic được gắn nhãn rõ.
6. Chốt dependency tối thiểu. `@typesafe-ai/sdk ^0.1.0` không có bản phù hợp theo kiểm tra hiện tại; không chỉ đổi version rồi coi tích hợp hoàn tất. Jev nằm ở pha 4, chưa cần để baseline chạy.
7. Ra quyết định tiếp tục: live branch, pregame/postgame branch, hoặc dừng nhánh Overwolf để tránh đầu tư sai. Nếu chỉ thiếu GEP nhưng shell dùng được: contract/synthetic/import thay capture live, người dùng phải import/bấm review; ghi nhận trade-off mất tự động hands-free. Nếu thiếu cả shell thì cần phương án và ước lượng mới, không coi nhánh nhập tay đã giải quyết UI. Không tự mở nhánh OCR thay thế.

## Tiêu chí hoàn tất

- [ ] Có quyết định phạm vi ghi rõ điều người dùng đã chọn và phần còn đề xuất.
- [ ] Có bằng chứng Windows load unpacked app và quyền cần thiết, hoặc blocker cụ thể kèm nhánh dự phòng khả thi.
- [ ] LoL/TFT được phân biệt bằng tín hiệu đã kiểm chứng; chưa rõ thì app im lặng.
- [ ] Có một bảng mapping feature/field cần dùng với source và sample; không đăng ký features theo suy đoán.
- [ ] Không còn tuyên bố README coi độ trễ/an toàn/phạm vi SDK là kết quả đo đã có.

## Rủi ro và xử lý

Quyền developer hoặc chính sách có thể chặn live branch lâu hơn 1–2 ngày: thời gian chờ không nằm trong ước lượng. Nếu shell vẫn hoạt động, có thể tiếp tục phần pregame/postgame bằng fixture/import với trade-off đã ghi; nếu shell cũng bị chặn thì cần lập lại phương án. TTS model và engine có giấy phép khác nhau: kiểm tra GPL-3.0 của engine Piper hiện hành và model card `vi_VN-vivos-x_low` trước khi đóng gói; không mặc nhiên gộp toàn bộ dưới MIT.
